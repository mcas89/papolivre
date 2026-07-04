// ===============================
// PapoLivre Chat Service
// Versão 2.0 — Firebase Realtime Database
// Mensagens em tempo real via RTDB
// ===============================

import {
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  onValue,
  off,
  serverTimestamp,
  set,
  onDisconnect,
  remove,
  get,
  startAt,
} from "firebase/database";

import { rtdb } from "../firebase/config";
import { sanitizeMessage } from "../utils/messageSanitizer";

// ============================================================
// HELPERS
// ============================================================

/**
 * Retorna a ref do nó de mensagens de uma sala.
 * Estrutura RTDB: /rooms/{roomId}/messages
 */
function messagesRef(roomId) {
  return ref(rtdb, `rooms/${roomId}/messages`);
}

/**
 * Retorna a ref de presença de usuários online em uma sala.
 * Estrutura RTDB: /rooms/{roomId}/presence/{uid}
 */
function presenceRef(roomId, uid) {
  return ref(rtdb, `rooms/${roomId}/presence/${uid}`);
}

// ============================================================
// CHAT SERVICE
// ============================================================

const chatService = {

  // -------------------------
  // Buscar últimas mensagens (uma vez)
  // -------------------------

  async getMessages(roomId = "general") {

    return new Promise((resolve) => {

      const q = query(
        messagesRef(roomId),
        orderByChild("timestamp"),
        limitToLast(100)
      );

      onValue(
        q,
        (snapshot) => {
          const msgs = [];
          snapshot.forEach((child) => {
            msgs.push({ id: child.key, ...child.val() });
          });
          resolve(msgs);
        },
        (err) => {
          console.warn("RTDB getMessages - Permissão Negada ou Erro:", err);
          resolve([]);
        },
        { onlyOnce: true }
      );

    });

  },

  // -------------------------
  // Limpar mensagens antigas (Manter max 100)
  // -------------------------
  async pruneMessages(roomId, maxCount = 100) {
    try {
      const { get, update } = await import("firebase/database");
      const mRef = messagesRef(roomId);
      const snapshot = await get(mRef);
      
      if (!snapshot.exists()) return;
      
      const msgs = snapshot.val();
      const keys = Object.keys(msgs);
      
      if (keys.length > maxCount) {
        // Ordena pelas mais antigas
        const sorted = keys
          .map(k => ({ key: k, timestamp: msgs[k].timestamp || 0 }))
          .sort((a,b) => a.timestamp - b.timestamp);
        
        // Pega as chaves excedentes para remover
        const toDelete = sorted.slice(0, sorted.length - maxCount);
        
        const updates = {};
        toDelete.forEach(item => {
          updates[item.key] = null;
        });
        
        await update(mRef, updates);
      }
    } catch (err) {
      console.warn("Erro ao tentar limpar mensagens antigas da sala:", err);
    }
  },

  // -------------------------
  // Enviar mensagem
  // -------------------------

  async sendMessage(roomId = "general", messageData) {
     const newMessage = {
       roomId: roomId || "general",
       timestamp: serverTimestamp(),
       private: Boolean(messageData.private),
       targetUser: messageData.targetUser || null,
       targetUserName: messageData.targetUserName || null,
       userId: messageData.userId || "unknown",
       userName: messageData.userName || "Usuário",
       userAvatar: messageData.userAvatar || null,
       text: sanitizeMessage(messageData.text) || "",
       type: messageData.type || "text",
       userPremium: Boolean(messageData.userPremium),
     };
    console.log("=== BEFORE PUSH ===");
    console.log("ROOM ID:", roomId);
    console.log("DATABASE URL:", rtdb.app.options.databaseURL);
    console.log("MESSAGE OBJECT:", newMessage);
    let pushRef;
    try {
      pushRef = await push(messagesRef(roomId), newMessage);
      console.log("=== PUSH SUCCESS ===");
      console.log("KEY:", pushRef.key);
      console.log("PATH:", pushRef.toString());
    } catch (error) {
      console.error("=== PUSH ERROR ===", error);
      throw error;
    }
    if (Math.random() < 0.20) {
      this.pruneMessages(roomId, 100);
    }
    return { id: pushRef.key, ...newMessage };
  },

  // -------------------------
  // Escutar mensagens em tempo real (subscribe)
  // Retorna função de unsubscribe
  // -------------------------

  subscribe(roomId = "general", callback) {
    const now = Date.now();

    const q = query(
      messagesRef(roomId),
      orderByChild("timestamp"),
      startAt(now),
      limitToLast(100)
    );

    const handleSnapshot = (snapshot) => {
      const msgs = [];
      snapshot.forEach((child) => {
        msgs.push({ id: child.key, ...child.val() });
      });
      callback(msgs);
    };

    const unsubscribe = onValue(q, handleSnapshot, (err) => {
      console.warn("RTDB Mensagens - Permissão Negada ou Erro:", err);
    });
    return unsubscribe;

  },

  // -------------------------
  // Escutar mensagens diretas em background (notificações)
  // Usa orderByChild("timestamp") — índice já existente e funcional.
  // Filtra targetUser no cliente (sem query equalTo, sem índice extra, sem 403).
  // -------------------------
  subscribeToMentions(roomId, userId, callback) {
    if (!roomId || !userId) return () => {};
    const listenerPath = `rooms/${roomId}/messages`;
    console.log("SUBSCRIBE QUERY PATH", listenerPath);
    // Mesma query do subscribe() principal — índice de timestamp já existe
    const q = query(
      messagesRef(roomId),
      orderByChild("timestamp"),
      limitToLast(1)
    );


    let lastSeenKey = null;
    let initialized = false;

    const handleSnapshot = (snapshot) => {
      console.log("MENTION SNAPSHOT", snapshot.val());
      if (!snapshot.exists()) {
        initialized = true;
        return;
      }

      let latestKey = null;
      let latestMsg = null;
      snapshot.forEach((child) => {
        latestKey = child.key;
        latestMsg = child.val();
      });

      if (!initialized) {
        // Primeira chamada: memoriza a chave histórica, não notifica
        lastSeenKey = latestKey;
        initialized = true;
        return;
      }

      // Chamadas seguintes: verifica condições estritas para gerar notificação
      if (latestKey && latestKey !== lastSeenKey) {
        lastSeenKey = latestKey;
        
        if (
          latestMsg?.userId !== userId &&
          latestMsg?.type !== "system" &&
          latestMsg?.targetUser &&
          latestMsg?.targetUser === userId
        ) {
          callback();
        }
      }
    };

    const unsubscribe = onValue(q, handleSnapshot, (err) => {
      console.warn("RTDB Mensagens Privadas - Permissão Negada ou Erro:", err);
    });
    return unsubscribe;
  },

  // -------------------------
  // Marcar usuário como online em uma sala
  // -------------------------

  async setPresence(roomId, user) {

    if (!user?.uid) return () => {};

    const pRef = presenceRef(roomId, user.uid);

    await onDisconnect(pRef).cancel();

    await set(pRef, {
      uid:      user.uid,
      name:     user.nickname || user.name || "Usuário",
      avatar:   user.avatar || "👤",
      online:   true,
      joinedAt: serverTimestamp(),
    });

    // Remove presença automaticamente ao desconectar
    await onDisconnect(pRef).remove();

    return async () => {
      await onDisconnect(pRef).cancel();
      await remove(pRef);
    };

  },

  // -------------------------
  // Obter quantidade de usuários ativos na sala (uma vez)
  // -------------------------

  async getPresenceCount(roomId) {
    const pRef = ref(rtdb, `rooms/${roomId}/presence`);
    try {
      const snapshot = await get(pRef);
      if (!snapshot.exists()) {
        return 0;
      }
      return Object.keys(snapshot.val()).length;
    } catch (err) {
      console.warn(`RTDB getPresenceCount (${roomId}) - Permissão Negada ou Erro:`, err);
      return 0;
    }
  },

  // -------------------------
  // Escutar usuários online de uma sala
  // -------------------------

  subscribePresence(roomId, callback) {

    const pRef = ref(rtdb, `rooms/${roomId}/presence`);

    const handleSnapshot = (snapshot) => {
      const users = [];
      snapshot.forEach((child) => {
        users.push({ id: child.key, ...child.val() });
      });
      callback(users);
    };

    const unsubscribe = onValue(pRef, handleSnapshot, (err) => {
      console.warn("RTDB Presença - Permissão Negada ou Erro:", err);
    });
    return () => unsubscribe();

  },

  // ============================================================
  // BLOQUEIOS (BLOCKS)
  // ============================================================

  /**
   * Bloqueia ou desbloqueia um usuário (toggle) de forma bidirecional
   */
  async toggleBlockUser(blockerId, blockedId, isCurrentlyBlocked) {
    if (!blockerId || !blockedId) return;
    
    const blockRef = ref(rtdb, `blocks/${blockerId}/blocked/${blockedId}`);
    const blockedByRef = ref(rtdb, `blocks/${blockedId}/blockedBy/${blockerId}`);
    
    if (isCurrentlyBlocked) {
      await remove(blockRef);
      await remove(blockedByRef);
    } else {
      await set(blockRef, true);
      await set(blockedByRef, true);
    }
  },

  /**
   * Escuta a lista global de bloqueios onde o usuário atual está envolvido
   * Retorna { blockedUsers: [], blockedBy: [] }
   */
  subscribeToBlocks(userId, callback) {
    if (!userId) return () => {};

    const myBlocksRef = ref(rtdb, `blocks/${userId}`);
    
    const handleMyBlocks = (snapshot) => {
      const blockedUsers = [];
      const blockedBy = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.blocked) {
          Object.keys(data.blocked).forEach(id => blockedUsers.push(id));
        }
        if (data.blockedBy) {
          Object.keys(data.blockedBy).forEach(id => blockedBy.push(id));
        }
      }
      callback({ blockedUsers, blockedBy });
    };

    const unsubscribe = onValue(myBlocksRef, handleMyBlocks, (err) => {
      console.warn("RTDB Blocks - Permissão Negada ou Erro:", err);
    });
    return unsubscribe;
  }

};

export default chatService;