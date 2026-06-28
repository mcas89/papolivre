// ===============================
// PapoLivre — useRoomSearch Hook
// Gerencia busca de salas com debounce
// ===============================

import { useState, useEffect, useCallback } from "react";
import roomService from "../services/roomService";

const DEBOUNCE_MS = 300;

function useRoomSearch() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca inicial — carrega todas as salas ao montar
  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setLoading(true);
      setError(null);
      try {
        const data = await roomService.getRooms();
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Erro ao carregar salas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRooms();

    return () => { cancelled = true; };
  }, []);

  // Busca com debounce ao digitar
  useEffect(() => {
    // Se query vazia, já temos os dados da carga inicial
    if (query.trim() === "") {
      roomService.getRooms().then(setResults).catch(() => {});
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await roomService.searchRooms(query);
        setResults(data);
      } catch (err) {
        setError(err.message || "Erro ao pesquisar salas");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  // Atualiza o count online de uma sala específica (chamado em tempo real pelo Home)
  const setRoomOnlineCount = useCallback((roomId, count) => {
    setResults((prev) =>
      prev.map((r) => r.id === roomId ? { ...r, online: count } : r)
    );
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
    setRoomOnlineCount,
    hasQuery: query.trim().length > 0,
  };
}

export default useRoomSearch;
