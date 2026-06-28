// ===============================
// PapoLivre — Room Service
// Versão 2.0 — Firebase Firestore
// Salas e dados fixos no Firestore
// ===============================

import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

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
      rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

};

export default roomService;
