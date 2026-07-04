import "./RoomCard.css";

import { Flame, Users, Clock, AlertTriangle } from "lucide-react";

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

  return (
    <article
      className={`room-card ${isHighlighted ? 'highlighted-room' : ''}`}
      onClick={() => onClick(room)}
    >
      <div className="room-left">

        <div className="room-icon">

          {room.icon}

        </div>

        <div className="room-info">

          <div className="room-title">

            <h3>{room.name}</h3>

            {room.featured && (
              <Flame
                size={15}
                className="featured"
              />
            )}
            
            {isHighlighted && (
              <span style={{
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '12px',
                fontWeight: 'bold',
                marginLeft: '8px',
                textTransform: 'uppercase'
              }}>
                Destacada
              </span>
            )}

          </div>

          <p>{room.description}</p>
          
          {room.isCustom && room.ownerName && (
            <p className="room-owner">Criada por: {room.ownerName}</p>
          )}

          {daysRemaining !== null && (
             <div className="room-badge" style={{ 
               color: daysRemaining <= 0 ? '#ef4444' : (daysRemaining === 1 ? '#f59e0b' : '#3b82f6'),
               display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold'
             }}>
               {daysRemaining <= 0 ? <Flame size={12} /> : (daysRemaining === 1 ? <AlertTriangle size={12} /> : <Clock size={12} />)}
               {daysRemaining <= 0 ? "Expira hoje" : (daysRemaining === 1 ? "Expira em 1 dia" : `${daysRemaining} dias restantes`)}
             </div>
          )}

        </div>

      </div>

      <div className="room-right">

        <Users size={16} />

        <span>{room.online}</span>

      </div>

    </article>
  );
}

export default RoomCard;