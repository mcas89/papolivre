import { useEffect, useState, useRef } from "react";
import effectService from "../../../services/effectService";
import EffectRenderer from "./EffectRenderer";
import { useChat } from "../../../context/ChatContext";
import "./EffectsLayer.css";

// ==========================================
// CAMADA PRINCIPAL DE EFEITOS
// ==========================================

function EffectsLayer({ roomId }) {
  const [activeEffects, setActiveEffects] = useState([]);
  const { currentUser } = useChat();

  useEffect(() => {
    if (!roomId || !currentUser) return;

    const unsubscribe = effectService.subscribeToEffects(roomId, currentUser, (newEffect) => {
      setActiveEffects(prev => {
        // Se o efeito já estiver ativo na tela, não duplica
        if (prev.some(e => e.id === newEffect.id)) return prev;
        
        // Adiciona com o timestamp estritamente local do navegador
        return [...prev, { ...newEffect, localReceivedAt: Date.now() }];
      });
    });

    return () => unsubscribe();
  }, [roomId]);

  // Limpeza automática (Housekeeping) do estado React
  useEffect(() => {
    if (activeEffects.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setActiveEffects(prev => prev.filter(effect => {
        const expiresAt = (effect.localReceivedAt || Date.now()) + (effect.duration || 4000);
        return expiresAt > now;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEffects]);

  if (activeEffects.length === 0) return null;

  return (
    <div className="effects-layer-container">
      {activeEffects.map(effect => (
        <EffectRenderer key={effect.id} effect={effect} />
      ))}
    </div>
  );
}

export default EffectsLayer;
