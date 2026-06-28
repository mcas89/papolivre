import "./RoomCard.css";

import { Flame, Users } from "lucide-react";

function RoomCard({ room, onClick }) {
  return (
    <article
      className="room-card"
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

          </div>

          <p>{room.description}</p>

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