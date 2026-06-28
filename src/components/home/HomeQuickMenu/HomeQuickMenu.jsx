import "./HomeQuickMenu.css";

import {
  Search,
  Users,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

function HomeQuickMenu({
  onlineUsers = 0,
  connectedRooms = 0,
  onSearch,
  onNearby,
  onRooms,
}) {
  return (
    <section className="quick-menu">

      <button
        className="quick-card"
        onClick={onSearch}
      >
        <div className="quick-icon search">
          <Search size={24} />
        </div>

        <div className="quick-info">
          <strong>Buscar</strong>
          <span>Pessoas e salas</span>
        </div>

        <ChevronRight size={18} />
      </button>

      <button
        className="quick-card"
        onClick={onNearby}
      >
        <div className="quick-icon nearby">
          <Users size={24} />
        </div>

        <div className="quick-info">
          <strong>Pessoas Próximas</strong>
          <span>{onlineUsers} pessoas online</span>
        </div>

        <ChevronRight size={18} />
      </button>

      <button
        className="quick-card"
        onClick={onRooms}
      >
        <div className="quick-icon rooms">
          <MessageCircle size={24} />
        </div>

        <div className="quick-info">
          <strong>Minhas Salas</strong>
          <span>{connectedRooms}/3 conectadas</span>
        </div>

        {connectedRooms > 0 && (
          <div className="quick-badge">
            {connectedRooms}
          </div>
        )}
      </button>

    </section>
  );
}

export default HomeQuickMenu;