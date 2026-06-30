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
import { ROUTES }    from "../constants/routes";

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
  const [unreadRooms,  setUnreadRooms]  = useState({});

  const lastViewedAt = useRef({});
  const currentRoomRef = useRef("geral");

  // Map de cleanup functions de presença por sala: { [roomId]: cleanupFn }
  // Isso NÃO é fonte de verdade — é bookkeeping técnico, atualizado
  // sempre junto com connectedRooms nos mesmos métodos (joinRoom/leaveRoom).
  const presenceCleanups = useRef({});

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
    setUnreadRooms(prev => { const {[currentRoom]: _, ...rest} = prev; return rest; });
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
  // PRESENÇA (usuários online) — exibe lista de online DA SALA ATUAL na UI
  // ======================

  useEffect(() => {

    // Escuta usuários online da sala atual
    const unsubPresence = chatService.subscribePresence(currentRoom, (users) => {
      setOnlineUsers(users);
    });

    return () => unsubPresence();

  }, [currentRoom]);

  // ======================
  // REGISTRAR PRESENÇA INICIAL (sala "geral")
  // Presença em outras salas é registrada dentro de joinRoom().
  // NÃO depende de currentRoom — evita auto-leave ao trocar sala.
  // ======================

  const userUid = user?.uid;
  const userName = user?.name;
  const userNickname = user?.nickname;
  const userAvatar = user?.avatar;

  useEffect(() => {
    if (!userUid) return;

    const userData = { uid: userUid, name: userNickname || userName, nickname: userNickname, avatar: userAvatar };

    chatService.setPresence("geral", userData).then(cleanup => {
      presenceCleanups.current["geral"] = cleanup;
    }).catch(err => console.error("Erro presença geral:", err));

    return () => {
      // Cleanup ALL presences on unmount (logout, close app, etc.)
      Object.entries(presenceCleanups.current).forEach(([, fn]) => {
        try { fn(); } catch(e) { /* best effort */ }
      });
      presenceCleanups.current = {};
    };
  }, [userUid, userName, userNickname, userAvatar]);

  // ======================
  // NOTIFICAÇÕES (Background Listeners)
  // Detecta mensagens novas em salas conectadas mas não focadas.
  // Dependência serializada em string para evitar loop infinito por referência de array.
  // ======================
  const connectedRoomsKey = user?.connectedRooms?.join(",") || "";

  useEffect(() => {
    if (!user?.uid || !connectedRoomsKey) return;

    // Constrói o conjunto de salas conectadas (connectedRooms do Firestore).
    // NÃO inclui currentRoom aqui — isso evita destruir/recriar todos os listeners
    // a cada troca de sala. O check de "estou vendo esta sala?" é feito via
    // currentRoomRef (ref) dentro do callback, que não precisa estar nos deps.
    const rooms = connectedRoomsKey.split(",").filter(Boolean);
    const unsubs = [];

    rooms.forEach((roomId) => {
      const unsub = chatService.subscribeToMentions(roomId, user.uid, () => {
        // Só suprime notificação se o usuário está OLHANDO esta sala na tela neste momento.
        // Em multi-sala: o usuário está conectado em várias, mas visualiza uma por vez.
        // Usa currentRoomRef (ref) em vez de currentRoom (state) para evitar stale closure.
        const isViewingThisRoom = (
          roomId === currentRoomRef.current &&
          window.location.pathname === ROUTES.ROOM
        );
        if (!isViewingThisRoom) {
          setUnreadRooms(prev => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }));
        }
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(fn => fn());
  }, [user?.uid, connectedRoomsKey]);

  // ======================
  // TROCAR DE SALA
  // ======================

  async function joinRoom(roomId) {

    // 1. Resolver geo ANTES de qualquer verificação de ID
    let targetRoomId = roomId;
    if (roomId === "pessoas_proximas") {
      const location = user?.location;
      if (!location || !location.latitude || !location.longitude) {
        return { success: false, error: "SEM_GEOLOCALIZACAO" };
      }
      const geoStep = 0.18;
      const latIndex = Math.round(location.latitude / geoStep);
      const lngIndex = Math.round(location.longitude / geoStep);
      targetRoomId = `geo_${latIndex}_${lngIndex}`;
    }

    // 2. Limite de salas (usa targetRoomId — ID já resolvido)
    const connectedRoomIds = user?.connectedRooms || [];
    const isNewRoom = !connectedRoomIds.includes(targetRoomId);

    if (isNewRoom) {
      const maxRooms = user?.isPremium ? 5 : 3;
      if (connectedRoomIds.length >= maxRooms) {
        return { success: false, error: "LIMITE_SALAS" };
      }
    }

    // 3. Se já estamos NESSA sala exata, limpa unread e retorna
    if (targetRoomId === currentRoom) {
      setUnreadRooms(prev => { const { [targetRoomId]: _, ...rest } = prev; return rest; });
      return { success: true, targetRoomId };
    }

    // 4. Limite de pessoas na sala (100 para grátis, 130 para premium)
    const count = await chatService.getPresenceCount(targetRoomId);
    const maxLimit = user?.isPremium ? 130 : 100;
    if (count >= maxLimit) {
      return { success: false, error: "SALA_CHEIA", limit: maxLimit };
    }

    // 5. Atualizar sala ativa na UI
    setCurrentRoom(targetRoomId);

    // 6. Registrar presença nesta sala (SEM remover de outras salas)
    if (user?.uid) {
      const userData = { uid: user.uid, name: user.nickname || user.name, nickname: user.nickname, avatar: user.avatar };
      try {
        const cleanup = await chatService.setPresence(targetRoomId, userData);
        presenceCleanups.current[targetRoomId] = cleanup;
      } catch (err) {
        console.error("Erro ao registrar presença:", err);
      }
    }

    // 7. Limpar unread desta sala
    setUnreadRooms(prev => { const { [targetRoomId]: _, ...rest } = prev; return rest; });

    // 8. Persistir no Firestore (connectedRooms) — só se for sala nova
    if (user?.uid && isNewRoom) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          connectedRooms: arrayUnion(targetRoomId)
        });

        // Mensagem de entrada (apenas quando conecta na sala pela primeira vez)
        if (targetRoomId !== "geral") {
          chatService.sendMessage(targetRoomId, {
            userId: "system",
            userName: "Sistema",
            userAvatar: "👋",
            text: `📥 ${user.nickname || user.name || "Alguém"} chegou na sala!`,
            type: "system"
          }).catch(() => {});
        }
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
      userPremium:   user.isPremium       || false,
    });

  }

  // ======================
  // SAIR DA SALA (aceita roomId explícito — não depende de currentRoom)
  // ======================

  async function leaveRoom(roomId = null) {
    if (!user?.uid) return;

    // Sala a sair: parâmetro explícito OU sala atual (fallback para compatibilidade)
    const actualRoomId = roomId || currentRoom;
    // Usa o mesmo ID para tudo — sem conversão geo_ → pessoas_proximas
    const firestoreRoomId = actualRoomId;

    // Mensagem de saída
    if (actualRoomId && actualRoomId !== "geral") {
      chatService.sendMessage(actualRoomId, {
        userId: "system",
        userName: "Sistema",
        userAvatar: "🚪",
        text: `🚪 ${user.nickname || user.name || "Alguém"} saiu da sala.`,
        type: "system"
      }).catch(() => {});
    }

    // Remover presença APENAS desta sala específica
    if (presenceCleanups.current[actualRoomId]) {
      try {
        await presenceCleanups.current[actualRoomId]();
      } catch (err) {
        console.error("Erro ao remover presença:", err);
      }
      delete presenceCleanups.current[actualRoomId];
    }

    // Remover do Firestore (connectedRooms)
    try {
      const { arrayRemove } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", user.uid), {
        connectedRooms: arrayRemove(firestoreRoomId)
      });
    } catch (err) {
      console.error("Erro ao sair da sala:", err);
    }

    // Se saiu da sala que estava visualizando, volta para geral
    if (actualRoomId === currentRoom) {
      setCurrentRoom("geral");
    }
  }

  // ======================
  // INATIVIDADE E FECHAMENTO DO APP
  // ======================
  
  useEffect(() => {
    if (!user?.uid) return;

    // 1. Cleanup de presença ao fechar a aba/aplicativo
    // (RTDB onDisconnect é o backup real para fechamentos abruptos)
    const handleUnload = () => {
      Object.values(presenceCleanups.current).forEach(fn => { try { fn(); } catch(e) { /* best effort */ } });
      presenceCleanups.current = {};
    };
    window.addEventListener("beforeunload", handleUnload);

    // 2. Desconectar por inatividade (15 minutos sem interação)
    const INACTIVITY_MS = 15 * 60 * 1000;
    let idleTimer;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // Limpar TODAS as presenças de todas as salas
        Object.values(presenceCleanups.current).forEach(fn => { try { fn(); } catch(e) { /* best effort */ } });
        presenceCleanups.current = {};
        alert("Você saiu da sala por inatividade.");
        window.location.href = "/";
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
  }, [user?.uid]);

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