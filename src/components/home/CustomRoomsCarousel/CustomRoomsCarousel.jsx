import "./CustomRoomsCarousel.css";
import { Users } from "lucide-react";

function CustomRoomsCarousel({ rooms, onRoomClick }) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <section className="custom-rooms-section">
      <h2 className="custom-rooms-title">Salas criadas por usuários</h2>
      
      <div className="custom-rooms-scroll-container">
        {rooms.map((room) => {
          const isHighlighted = room.highlightedUntil && 
            (room.highlightedUntil.toMillis ? room.highlightedUntil.toMillis() : new Date(room.highlightedUntil).getTime()) > Date.now();

          return (
            <button
              key={room.id}
              className={`custom-room-square ${isHighlighted ? "highlighted-square" : ""}`}
              onClick={() => onRoomClick(room)}
              aria-label={`Entrar na sala ${room.name}`}
            >
              <div className="custom-room-icon-wrapper">
                <span className="custom-room-emoji">{room.icon || "💬"}</span>
                {isHighlighted && <span className="highlight-star">⭐</span>}
              </div>
              
              <h3 className="custom-room-name">{room.name}</h3>
              
              <div className="custom-room-online">
                <Users size={10} />
                <span>{room.online || 0}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CustomRoomsCarousel;
