import "./RoomHeader.css";

import {
  House,
  Users,
  MessageCircle,
  LogOut,
} from "lucide-react";

function RoomHeader({
  roomName = "Pessoas Próximas",
  onlineCount = 0,
  onHome,
  onUsers,
  onRooms,
  onLeave,
  unreadCount = 0,
}) {
  return (
    <header className="room-header">

      <button
        className="icon-button"
        onClick={onHome}
      >
        <House size={20} />
      </button>

      <div className="room-title">

      <div className="room-name">
        {roomName}
      </div>

        <span>

          <span className="status-dot"></span>

          {onlineCount} online

        </span>

      </div>

      <div className="room-actions">

        <button
          className="icon-button"
          onClick={onUsers}
        >
          <Users size={20} />
        </button>

        <button
          className="icon-button"
          onClick={onRooms}
          style={{ position: "relative" }}
        >
          <MessageCircle size={20} />
          {unreadCount > 0 && (
            <span className="badge-notification" style={{ top: -2, right: -2 }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          className="icon-button logout"
          onClick={onLeave}
        >
          <LogOut size={20} />
        </button>

      </div>

    </header>
  );
}

export default RoomHeader;