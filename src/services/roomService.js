// ===============================
// PapoLivre — Room Service
// Versão 2.0 — Firebase Firestore
// Salas e dados fixos no Firestore
// ===============================

import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import creditService from "./creditService";

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// ============================================================
// DADOS INICIAIS (seed)
// Usados apenas para popular o Firestore na primeira execução
// ============================================================

export const DEFAULT_ROOMS = [
  {
    id:          "geral",
    icon:        "💬",
    name:        "Bate-Papo Livre",
    description: "Converse sobre qualquer assunto sem filtros",
    featured:    false,
    tags:        ["geral", "papo", "conversa", "livre"],
    online:      0,
  },
  {
    id:          "sao-paulo",
    icon:        "🌆",
    name:        "São Paulo",
    description: "O papo da maior cidade do Brasil",
    featured:    false,
    tags:        ["são paulo", "sampa", "sp", "cidade"],
    online:      0,
  },
  {
    id:          "relacionamentos",
    icon:        "❤️",
    name:        "Relacionamentos",
    description: "Amor, amizade e tudo que envolve pessoas",
    featured:    false,
    tags:        ["amor", "namoro", "amizade", "relacionamento"],
    online:      0,
  },
  {
    id:          "games",
    icon:        "🎮",
    name:        "Games",
    description: "Tudo sobre jogos: PC, console e mobile",
    featured:    false,
    tags:        ["games", "videogame", "rpg", "fps", "mobile"],
    online:      0,
  },
  {
    id:          "musica",
    icon:        "🎵",
    name:        "Música",
    description: "Compartilhe playlists, bandas e artistas",
    featured:    false,
    tags:        ["música", "playlist", "artistas", "banda", "rap"],
    online:      0,
  },
  {
    id:          "estudos",
    icon:        "📚",
    name:        "Estudos",
    description: "Tire dúvidas e troque conhecimento",
    featured:    false,
    tags:        ["estudo", "escola", "faculdade", "concurso", "enem"],
    online:      0,
  },
  {
    id:          "futebol",
    icon:        "⚽",
    name:        "Futebol",
    description: "Debate quente do apito final",
    featured:    false,
    tags:        ["futebol", "esporte", "copa", "brasileirao", "libertadores"],
    online:      0,
  },
  {
    id:          "tecnologia",
    icon:        "💻",
    name:        "Tecnologia",
    description: "Tech, programação, gadgets e inovação",
    featured:    false,
    tags:        ["tecnologia", "tech", "programação", "dev", "ia", "startups"],
    online:      0,
  },
  {
    id:          "memes",
    icon:        "😂",
    name:        "Memes & Humor",
    description: "Só piada boa e muita zueira",
    featured:    false,
    tags:        ["memes", "humor", "zueira", "engraçado", "viral"],
    online:      0,
  },
  {
    id:          "saude",
    icon:        "🌿",
    name:        "Saúde & Bem-estar",
    description: "Dicas de saúde, dieta, mente e corpo",
    featured:    false,
    tags:        ["saúde", "fitness", "dieta", "mental", "academia", "meditação"],
    online:      0,
  },
];

// ============================================================
// ROOM SERVICE
// ============================================================

const roomService = {

  // -------------------------
  // Buscar todas as salas do Firestore
  // -------------------------

  async getRooms() {

    const snap = await getDocs(
      query(collection(db, "rooms"), orderBy("featured", "desc"))
    );

    let rooms = [];

    // Se o Firestore estiver vazio, faz seed automático
    if (snap.empty) {
      await roomService.seedRooms();
      rooms = [...DEFAULT_ROOMS];
    } else {
      const now = new Date().getTime();
      rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(r => {
        // Ocultar salas customizadas expiradas
        if (r.isCustom && r.expiresAt) {
          const expTime = r.expiresAt?.toMillis ? r.expiresAt.toMillis() : new Date(r.expiresAt).getTime();
          return expTime > now;
        }
        return true;
      });
      
      // Ordena salas destacadas (highlightedUntil > now) no topo
      rooms.sort((a, b) => {
        const aHigh = a.highlightedUntil && (a.highlightedUntil.toMillis ? a.highlightedUntil.toMillis() : new Date(a.highlightedUntil).getTime()) > now ? 1 : 0;
        const bHigh = b.highlightedUntil && (b.highlightedUntil.toMillis ? b.highlightedUntil.toMillis() : new Date(b.highlightedUntil).getTime()) > now ? 1 : 0;
        if (aHigh !== bHigh) return bHigh - aHigh; // Destacadas primeiro
        
        // Desempate: salas fixas (não customizadas) primeiro, ou por popularidade
        if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
        return 0;
      });
    }

    // Busca contagem online de cada sala via RTDB
    try {
      const { default: chatService } = await import("./chatService");
      rooms = await Promise.all(rooms.map(async (r) => {
        const count = await chatService.getPresenceCount(r.id);
        return { ...r, online: count };
      }));
    } catch (err) {
      console.warn("Erro ao buscar contagem online das salas:", err);
    }

    return rooms;

  },

  // -------------------------
  // Pesquisar salas (filtro client-side)
  // Firestore não tem full-text nativo;
  // para escala usar Algolia/Typesense
  // -------------------------

  async searchRooms(queryText) {

    const all = await roomService.getRooms();

    if (!queryText || queryText.trim() === "") return all;

    const q = queryText.toLowerCase().trim();

    return all.filter((room) =>
      room.name.toLowerCase().includes(q)        ||
      room.description.toLowerCase().includes(q) ||
      (room.tags || []).some((tag) => tag.includes(q))
    );

  },

  // -------------------------
  // Popular Firestore com as salas padrão
  // (executado automaticamente na primeira vez)
  // -------------------------

  async seedRooms() {

    const writes = DEFAULT_ROOMS.map((room) =>
      setDoc(doc(db, "rooms", room.id), {
        ...room,
        createdAt: serverTimestamp(),
      })
    );

    await Promise.all(writes);

    console.log("[roomService] Salas inseridas no Firestore ✅");

  },

  // -------------------------
  // SALAS CUSTOMIZADAS (Premium / Temporárias)
  // -------------------------

  async createCustomRoom(user, params, isPremium) {
    if (!user || (user.isAnonymous && user.anonymous)) throw new Error("Apenas usuários registrados podem criar salas.");
    if (!params.name || !params.icon) throw new Error("Nome e ícone são obrigatórios.");

    const cost = 10;
    
    // Se não for premium, tenta descontar
    if (!isPremium) {
      await creditService.removeCredits(user.uid, cost, `Criação de sala: ${params.name}`, "ROOM_CREATION");
    }

    const roomRef = doc(collection(db, "rooms"));
    const now = new Date();
    const expiresAt = addDays(now, 7);

    const roomData = {
      id: roomRef.id,
      name: params.name,
      icon: params.icon,
      description: params.description || "",
      tags: params.tags || [],
      featured: false,
      isCustom: true,
      ownerId: user.uid,
      ownerName: user.nickname || user.name || "Usuário",
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
      online: 0
    };

    await setDoc(roomRef, roomData);
    return roomData;
  },

  async renewCustomRoom(user, roomId, isPremium) {
    if (!user) throw new Error("Apenas usuários registrados podem renovar salas.");

    const cost = 8;
    if (!isPremium) {
      await creditService.removeCredits(user.uid, cost, `Renovação de sala: ${roomId}`, "ROOM_RENEWAL");
    }

    const roomRef = doc(db, "rooms", roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) throw new Error("Sala não encontrada.");
    
    const data = snap.data();
    if (data.ownerId !== user.uid) throw new Error("Apenas o criador pode renovar esta sala.");

    // Se já estava vencida, renova a partir de hoje. Senão, adiciona 7 dias ao vencimento atual.
    const now = new Date();
    const currentExp = data.expiresAt?.toMillis ? new Date(data.expiresAt.toMillis()) : new Date(data.expiresAt);
    const newBaseDate = currentExp > now ? currentExp : now;
    const newExp = addDays(newBaseDate, 7);

    await updateDoc(roomRef, { expiresAt: newExp });
    return newExp;
  },

  // -------------------------
  // DESTACAR SALA (24 horas)
  // -------------------------

  async highlightRoom(user, roomId) {
    if (!user) throw new Error("Usuário não autenticado.");

    // 1. Validar quantas salas já estão destacadas (máx 2)
    const allRooms = await this.getRooms();
    const now = new Date().getTime();
    const activeHighlights = allRooms.filter(r => {
      const expTime = r.highlightedUntil?.toMillis ? r.highlightedUntil.toMillis() : new Date(r.highlightedUntil || 0).getTime();
      return expTime > now;
    });

    if (activeHighlights.length >= 2) {
      throw new Error("Já existem 2 salas destacadas no momento. Aguarde o prazo de uma delas expirar para destacar a sua.");
    }

    // 2. Verificar se a sala existe
    const roomRef = doc(db, "rooms", roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) throw new Error("Sala não encontrada.");
    
    const roomData = snap.data();
    if (roomData.isCustom && roomData.ownerId !== user.uid) {
      throw new Error("Você só pode destacar salas padrão ou as salas que você mesmo criou.");
    }

    // 3. Descontar créditos (destaque custa 15 créditos)
    const cost = 15;
    await creditService.removeCredits(user.uid, cost, `Destaque de sala: ${roomData.name}`, "ROOM_HIGHLIGHT");

    // 4. Aplicar o destaque (24 horas)
    const highlightExp = addDays(new Date(), 1);
    await updateDoc(roomRef, { 
      highlightedUntil: highlightExp 
    });

    return highlightExp;
  },

  async getMyCustomRooms(userId) {
    if (!userId) return [];
    const q = query(collection(db, "rooms"), where("ownerId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // -------------------------
  // LIMPEZA DE SALAS (DEV/ADMIN)
  // -------------------------
  async cleanupExpiredRooms() {
    const now = new Date();
    // No Firestore, para consultar e filtrar por expiresAt, precisamos que seja um campo Date ou Timestamp.
    // E precisamos ter certeza de filtrar as isCustom.
    const q = query(
      collection(db, "rooms"),
      where("isCustom", "==", true),
      where("expiresAt", "<", now)
    );
    
    const snap = await getDocs(q);
    let deletedCount = 0;
    
    const deletes = snap.docs.map(d => {
      deletedCount++;
      return deleteDoc(d.ref);
    });
    
    await Promise.all(deletes);
    return deletedCount;
  }

};

export default roomService;
