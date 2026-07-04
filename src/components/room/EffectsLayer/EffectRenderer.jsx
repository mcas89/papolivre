import React from "react";

// Imports estáticos diretos para garantir que o Vite empacote os SVGs corretamente e não gere ERR_CONNECTION_REFUSED
import coracao from "../../../assets/effects/coracao.svg";
import mandandobeijo from "../../../assets/effects/mandandobeijo.svg";
import dedo from "../../../assets/effects/dedo.svg";
import linguasensual from "../../../assets/effects/linguasensual.svg";
import soco from "../../../assets/effects/soco.svg";
import noelpum from "../../../assets/effects/noelpum.svg";

const svgAssets = {
  coracao,
  mandandobeijo,
  dedo,
  linguasensual,
  soco,
  noelpum
};

function EffectRenderer({ effect }) {
  const isPrivate = !!effect.targetUserName;
  const svgUrl = svgAssets[effect.effectId];

  if (!svgUrl) {
    console.warn(`Fallback: SVG estático não encontrado para ${effect.effectId}`);
    return null;
  }

  return (
    <div 
      className="svg-animado-container"
      style={{ animationDuration: `${effect.duration || 4000}ms` }}
    >
      <div className="svg-animado-target-label">
        {isPrivate 
          ? `✨ De ${effect.userName} para ${effect.targetUserName}`
          : `✨ ${effect.userName} enviou`
        }
      </div>
      <img 
        src={`${svgUrl}?t=${effect.timestamp || Date.now()}`} 
        alt={`Efeito ${effect.effectId}`} 
        className="svg-animado-player" 
      />
    </div>
  );
}

export default EffectRenderer;
