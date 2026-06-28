// src/components/room/UsersDrawer.jsx
import "./UsersDrawer.css";
import { X } from "lucide-react";

const UsersDrawer = ({ onlineUsers, selectedUser, onSelectUser, onClose, blockedUsers = [], onToggleBlock }) => {
  return (
    <>
    <div className="users-drawer-overlay" onClick={onClose} />
    <div className="users-drawer">
      <div className="drawer-header">
        <h3>Online agora ({onlineUsers.length})</h3>
        <button onClick={onClose}>
          <X size={26} />
        </button>
      </div>
      <div className="users-list">
        {onlineUsers.map((user) => {
          const isBlocked = blockedUsers.includes(user.id);
          
          return (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.userId === user.id ? "selected" : ""} ${isBlocked ? "blocked" : ""}`}
            onClick={() => {
              if (!isBlocked) onSelectUser(user);
            }}
            style={{ opacity: isBlocked ? 0.5 : 1 }}
          >
            <div className="user-avatar-wrapper">
              {(() => {
                const avatar = user.avatar || `https://i.pravatar.cc/150?u=${user.id}`;
                const isEmoji = avatar && !avatar.startsWith("http") && !avatar.startsWith("data:") && !avatar.startsWith("/");
                return isEmoji ? (
                  <div className="user-avatar emoji-avatar">{avatar}</div>
                ) : (
                  <img src={avatar} alt={user.name} className="user-avatar" />
                );
              })()}
              <span className="user-status-dot" style={{ background: isBlocked ? 'gray' : '' }}></span>
            </div>
            <div className="user-info">
              <span className="user-name" style={{ textDecoration: isBlocked ? 'line-through' : 'none' }}>
                {user.name} {isBlocked && "(Bloqueado)"}
              </span>
              <span className="user-status">{isBlocked ? "bloqueado" : "online"}</span>
            </div>
            <div className="user-actions">
              <button 
                className={`action-btn ${isBlocked ? "action-btn-blocked" : ""}`} 
                title={isBlocked ? "Desbloquear" : "Bloquear"} 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBlock(user.id);
                }}
              >
                {isBlocked ? "✅" : "🚫"}
              </button>
              {!isBlocked && (
                <button className="action-btn" title="Denunciar" onClick={(e) => e.stopPropagation()}>⚠️</button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default UsersDrawer;