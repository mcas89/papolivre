import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";
import chatService    from "../services/chatService";
import { useAuth }   from "./AuthContext";

const ChatContext = createContext();

export function ChatProvider({ children }) {

  const { user } = useAuth();

  // ======================
  // ESTADOS DO CHAT
  // ======================

  const [currentRoom,  setCurrentRoom]  = useState("geral");
  const [roomName,     setRoomName]     = useState("Bate-Papo Livre");
  const [messages,     setMessages]     = useState([]);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [unreadRooms,  setUnreadRooms]  = useState([]);

  // ======================
  // CONTROLE DE NOTIFICAÇÕES DE FUNDO
  // ======================
  const lastViewedAt = useRef({});
  const currentRoomRef = useRef("geral");

  // Ref para guardar cleanup de presença (evita duplo registro)
  const presenceCleanupRef = useRef(null);

  // ======================
  // CARREGAMENTO INICIAL + SUBSCRIBE MSGS
  // ======================

  const cutoffRef = useRef(null);

  useEffect(() => {

    setLoading(true);
    setMessages([]);
    cutoffRef.current = null; // Reset cutoff when changing rooms
    currentRoomRef.current = currentRoom;

    // Remove sala atual das não lidas e atualiza o timestamp
    setUnreadRooms(prev => prev.filter(r => r !== currentRoom));
    lastViewedAt.current[currentRoom] = Date.now();

    // Carrega histórico e já liga o listener de tempo real
    const unsubscribeMsgs = chatService.subscribe(currentRoom, (msgs) => {
      
      // Quando carrega pela primeira vez na sala, define o limite de tempo
      // para exibir apenas as últimas 5 mensagens (perdendo o histórico mais antigo)
      if (cutoffRef.current === null) {
        if (msgs.length > 5) {
          cutoffRef.current = msgs[msgs.length - 5].timestamp || 0;
        } else {
          cutoffRef.current = 0;
        }
      }

      // Filtra as mensagens para não exibir as anteriores ao cutoff
      const visibleMsgs = msgs.filter(m => (m.timestamp || 0) >= cutoffRef.current);
      
      setMessages(visibleMsgs);
      setLoading(false);
    });

    // Atualiza o nome da sala de forma amigável
    if (currentRoom.startsWith("geo_")) {
      setRoomName("📍 Pessoas Próximas");
    } else {
      const fixedRoomNames = {
        "geral": "💬 Bate-Papo Livre",
        "sao-paulo": "🌆 São Paulo",
        "relacionamentos": "❤️ Relacionamentos",
        "games": "🎮 Games",
        "musica": "🎵 Música",
        "estudos": "📚 Estudos",
        "futebol": "⚽ Futebol",
        "tecnologia": "💻 Tecnologia",
        "memes": "😂 Memes & Humor",
        "saude": "🌿 Saúde & Bem-estar",
      };
      setRoomName(fixedRoomNames[currentRoom] || "Sala de Chat");
    }

    return () => {
      // Quando sai da sala, atualiza o timestamp de última visualização
      lastViewedAt.current[currentRoom] = Date.now();
      unsubscribeMsgs();
      setLoading(true);
    };

  }, [currentRoom]);

  // ======================
  // PRESENÇA (usuários online)
  // ======================

  useEffect(() => {

    // Escuta usuários online da sala atual
    const unsubPresence = chatService.subscribePresence(currentRoom, (users) => {
      setOnlineUsers(users);
    });

    return () => unsubPresence();

  }, [currentRoom]);

  // ======================
  // REGISTRAR PRESENÇA DO USUÁRIO
  // ======================

  useEffect(() => {

    if (!user) return;

    let cleanup = null;

    chatService.setPresence(currentRoom, user).then((fn) => {
      cleanup = fn;
      presenceCleanupRef.current = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };

  }, [currentRoom, user]);

  // ======================
  // NOTIFICAÇÕES (Background Listeners)
  // ======================

  useEffect(() => {
    if (!user?.uid || !user?.connectedRooms || user.connectedRooms.length === 0) return;

    const unsubs = [];

    user.connectedRooms.forEach((roomId) => {
      // Inicializa o tempo se nunca foi visto nesta sessão
      if (!lastViewedAt.current[roomId]) {
        lastViewedAt.current[roomId] = Date.now();
      }

      const unsub = chatService.subscribeToMentions(roomId, user.uid, (msg) => {
        if (!msg) return;

        // Se a mensagem for mais nova que a nossa última visualização
        // e nós NÃO estivermos na sala no momento
        if (msg.timestamp > lastViewedAt.current[roomId] && roomId !== currentRoomRef.current) {
          setUnreadRooms((prev) => {
            if (!prev.includes(roomId)) {
              return [...prev, roomId];
            }
            return prev;
          });
        }
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(fn => fn());
  }, [user?.uid, user?.connectedRooms]);

  // ======================
  // TROCAR DE SALA
  // ======================

  async function joinRoom(roomId) {

    // 1. Limite de salas conectadas simultaneamente (somente se não estiver conectado ainda)
    const connectedRoomIds = user?.connectedRooms || [];
    const isNewRoom = !connectedRoomIds.includes(roomId);

    if (isNewRoom) {
      const maxRooms = user?.isPremium ? 5 : 3;
      if (connectedRoomIds.length >= maxRooms) {
        return { success: false, error: "LIMITE_SALAS" };
      }
    }

    // 2. Se for sala de geolocalização, resolvemos para o ID do quadrante do usuário
    let targetRoomId = roomId;
    if (roomId === "pessoas_proximas") {
      const location = user?.location;
      if (!location || !location.latitude || !location.longitude) {
        return { success: false, error: "SEM_GEOLOCALIZACAO" };
      }
      const geoStep = 0.18; // equivalente a ~20km de precisão
      const latIndex = Math.round(location.latitude / geoStep);
      const lngIndex = Math.round(location.longitude / geoStep);
      targetRoomId = `geo_${latIndex}_${lngIndex}`;
    }

    // 3. Se já estamos NESSA sala exata, não precisa fazer nada — apenas navegar
    if (targetRoomId === currentRoom) {
      return { success: true, targetRoomId };
    }

    // 4. Limite de pessoas na sala (100 para grátis, 130 para premium)
    const count = await chatService.getPresenceCount(targetRoomId);
    const maxLimit = user?.isPremium ? 130 : 100;
    if (count >= maxLimit) {
      return { success: false, error: "SALA_CHEIA", limit: maxLimit };
    }

    // 5. Executa a entrada real
    if (presenceCleanupRef.current) {
      await presenceCleanupRef.current();
      presenceCleanupRef.current = null;
    }

    setCurrentRoom(targetRoomId);

    // Salva a sala nas conectadas do usuário no Firestore
    if (user?.uid && isNewRoom) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          connectedRooms: arrayUnion(roomId)
        });

        // Envia a mensagem automática de boas-vindas/entrada
        await chatService.sendMessage(targetRoomId, {
          userId: "system",
          userName: "Sistema",
          userAvatar: "👋",
          text: `${user.nickname || user.name || "Alguém"} entrou na sala.`,
          type: "system"
        });

      } catch (err) {
        console.error("Erro ao salvar sala conectada:", err);
      }
    }

    return { success: true, targetRoomId };

  }

  // ======================
  // ENVIAR MENSAGEM
  // ======================

  async function sendMessage(text, options = {}) {

    if (!text?.trim() || !user) return;

    await chatService.sendMessage(currentRoom, {
      userId:        user.uid,
      userName:      user.nickname || user.name || "Usuário",
      userAvatar:    user.avatar || (user.anonymous ? "👤" : "👤"),
      text:          text.trim(),
      private:       options.private      || false,
      targetUser:    options.targetUser   || null,
      targetUserName: options.targetUserName || null,
    });

  }

  // ======================
  // SAIR DA SALA
  // ======================

  async function leaveRoom() {
    if (!user?.uid) return;

    // Remove a sala conectada atual do array no Firestore
    // Procuramos qual o ID original que foi salvo (se é geo_ usamos pessoas_proximas para limpar)
    const roomIdToLeave = currentRoom?.startsWith("geo_") ? "pessoas_proximas" : currentRoom;

    if (presenceCleanupRef.current) {
      await presenceCleanupRef.current();
      presenceCleanupRef.current = null;
    }

    try {
      const { arrayRemove } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", user.uid), {
        connectedRooms: arrayRemove(roomIdToLeave)
      });
    } catch (err) {
      console.error("Erro ao sair da sala:", err);
    }

    setCurrentRoom("geral"); // volta para um ID default seguro para não quebrar listeners
  }

  // ======================
  // INATIVIDADE E FECHAMENTO DO APP
  // ======================
  
  useEffect(() => {
    if (!user || currentRoom === "geral") return;

    // 1. Desconectar ao fechar a aba/aplicativo
    const handleUnload = (e) => {
      // Como o unload é síncrono e não podemos esperar Promises, usamos o onDisconnect do RTDB
      // Mas para o Firestore tentamos um fechamento "best effort"
      leaveRoom(); 
    };
    window.addEventListener("beforeunload", handleUnload);

    // 2. Desconectar por inatividade (ex: 15 minutos sem mexer no mouse/tela)
    const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutos
    let idleTimer;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        leaveRoom();
        alert("Você saiu da sala por inatividade.");
        window.location.href = "/"; // redireciona para home
      }, INACTIVITY_MS);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);
    
    resetIdleTimer();

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [user, currentRoom]);

  // ======================
  // BLOQUEIO DE USUÁRIOS
  // ======================

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedBy, setBlockedBy] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = chatService.subscribeToBlocks(user.uid, (blocks) => {
      setBlockedUsers(blocks.blockedUsers);
      setBlockedBy(blocks.blockedBy);
    });
    return () => unsub();
  }, [user?.uid]);

  async function toggleBlockUser(targetUserId) {
    if (!user?.uid) return;
    const isCurrentlyBlocked = blockedUsers.includes(targetUserId);
    await chatService.toggleBlockUser(user.uid, targetUserId, isCurrentlyBlocked);
  }

  // ======================
  // CONTEXTO FINAL
  // ======================

  // Filtra as mensagens e usuários online para remover os bloqueados (e por quem fomos bloqueados)
  const filteredMessages = messages.filter(m => 
    !blockedUsers.includes(m.userId) && !blockedBy.includes(m.userId)
  );

  const filteredOnlineUsers = onlineUsers.filter(u => 
    !blockedBy.includes(u.id)
  );

  const value = {
    // user
    currentUser: user,

    // chat
    messages: filteredMessages,
    onlineUsers: filteredOnlineUsers,
    currentRoom,
    roomName,
    loading,

    // actions
    sendMessage,
    joinRoom,
    leaveRoom,
    toggleBlockUser,
    blockedUsers, // útil para a UI mostrar o status correto
    unreadRooms,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );

}

export function useChat() {
  return useContext(ChatContext);
}