import { useState, useEffect } from "react";
import "./RoomCard.css";

import { 
  Flame, Users, Clock, AlertTriangle, 
  Cpu, Heart, Dumbbell, MapPin, 
  PartyPopper, Music, Gamepad2, Film, 
  Trophy, MessageCircle 
} from "lucide-react";

// ==========================================
// ESTILOS POR TEMA (Spotify / Apple Music style)
// ==========================================
const THEME_STYLES = {
  tecnologia: { gradient: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)", Icon: Cpu },
  amor: { gradient: "linear-gradient(135deg, #be123c 0%, #f43f5e 100%)", Icon: Heart },
  saude: { gradient: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)", Icon: Dumbbell },
  sao_paulo: { gradient: "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)", Icon: MapPin },
  festa: { gradient: "linear-gradient(135deg, #4c1d95 0%, #a855f7 100%)", Icon: PartyPopper },
  musica: { gradient: "linear-gradient(135deg, #831843 0%, #ec4899 100%)", Icon: Music },
  jogos: { gradient: "linear-gradient(135deg, #14532d 0%, #22c55e 100%)", Icon: Gamepad2 },
  filme: { gradient: "linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)", Icon: Film },
  futebol: { gradient: "linear-gradient(135deg, #3f6212 0%, #84cc16 100%)", Icon: Trophy },
  geral: { gradient: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)", Icon: MessageCircle }
};

function getRoomTheme(roomName, roomDesc) {
  const text = `${roomName} ${roomDesc}`.toLowerCase();
  
  if (text.includes("tecnologia") || text.includes("dev") || text.includes("program")) return THEME_STYLES.tecnologia;
  if (text.includes("amor") || text.includes("namoro") || text.includes("casal") || text.includes("crush") || text.includes("relacionamento")) return THEME_STYLES.amor;
  if (text.includes("saude") || text.includes("saúde") || text.includes("bem estar") || text.includes("bem-estar") || text.includes("fitness")) return THEME_STYLES.saude;
  if (text.includes("são paulo") || text.includes("sao paulo") || text.includes(" sp")) return THEME_STYLES.sao_paulo;
  if (text.includes("festa") || text.includes("balada") || text.includes("role")) return THEME_STYLES.festa;
  if (text.includes("música") || text.includes("rock") || text.includes("pop")) return THEME_STYLES.musica;
  if (text.includes("jogo") || text.includes("game") || text.includes("rpg")) return THEME_STYLES.jogos;
  if (text.includes("filme") || text.includes("cinema") || text.includes("série")) return THEME_STYLES.filme;
  if (text.includes("futebol") || text.includes("esporte")) return THEME_STYLES.futebol;

  return THEME_STYLES.geral;
}

function RoomCard({ room, onClick }) {
  let daysRemaining = null;
  if (room.isCustom && room.expiresAt) {
    const expTime = room.expiresAt?.toMillis ? room.expiresAt.toMillis() : new Date(room.expiresAt).getTime();
    daysRemaining = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
  }
  
  let isHighlighted = false;
  if (room.highlightedUntil) {
    const highTime = room.highlightedUntil?.toMillis ? room.highlightedUntil.toMillis() : new Date(room.highlightedUntil).getTime();
    if (highTime > Date.now()) isHighlighted = true;
  }

  // Obter estilo baseada no tema da sala
  const theme = getRoomTheme(room.name, room.description || "");
  const ThemeIcon = theme.Icon;

  return (
    <article
      className={`room-gallery-card ${isHighlighted ? 'highlighted-room' : ''}`}
      onClick={() => onClick(room)}
    >
      <div className="room-cover-wrapper" style={{ background: theme.gradient }}>
        <div className="room-cover-icon-bg">
          <ThemeIcon size={42} strokeWidth={1.5} color="rgba(255, 255, 255, 0.4)" />
        </div>
        <div className="room-cover-overlay"></div>
        
        {/* Badges Flutuantes sobre a Imagem */}
        <div className="card-badges-top-right">
          {room.featured && (
            <div className="badge-featured" title="Sala em Alta">
              <Flame size={14} strokeWidth={2.5} />
            </div>
          )}
          {isHighlighted && (
            <div className="badge-highlight">
              Destacada
            </div>
          )}
          {daysRemaining !== null && (
             <div className="badge-expiry" style={{ 
               backgroundColor: daysRemaining <= 0 ? 'rgba(239, 68, 68, 0.15)' : (daysRemaining === 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
               color: daysRemaining <= 0 ? '#ef4444' : (daysRemaining === 1 ? '#f59e0b' : '#60a5fa')
             }}>
               {daysRemaining <= 0 ? <Flame size={12} /> : (daysRemaining === 1 ? <AlertTriangle size={12} /> : <Clock size={12} />)}
               <span>{daysRemaining <= 0 ? "Expira hoje" : (daysRemaining === 1 ? "1 dia" : `${daysRemaining} dias`)}</span>
             </div>
          )}
        </div>
      </div>

      <div className="card-info-section">
        <div className="card-text-content">
          <div className="card-title-row">
            <h3 className="card-title">{room.name}</h3>
            <div className="card-online-badge">
              <Users size={12} />
              <span>{room.online} Online</span>
            </div>
          </div>
          <p className="card-description">{room.description}</p>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;