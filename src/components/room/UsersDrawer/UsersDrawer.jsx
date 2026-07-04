// src/components/room/UsersDrawer.jsx
import "./UsersDrawer.css";
import { X } from "lucide-react";
import UserAvatar from "../../ui/UserAvatar/UserAvatar";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

const UsersDrawer = ({ onlineUsers, selectedUser, onSelectUser, onClose, blockedUsers = [], onToggleBlock, currentUserId }) => {
  const navigate = useNavigate();

  // Oculta o próprio usuário da lista — não faz sentido selecionar a si mesmo
  const otherUsers = onlineUsers.filter(u => u.id !== currentUserId);

  return (
    <>
      <div className="users-drawer-overlay" onClick={onClose} />
      <div className="users-drawer">
        <div className="drawer-header">
          <h3>Online agora ({otherUsers.length})</h3>
          <button onClick={onClose}>
            <X size={26} />
          </button>
        </div>
        <div className="users-list">
          {otherUsers.map((user) => {
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
                  <UserAvatar avatarData={user.avatar} fallbackUid={user.id} size={36} className="user-avatar" />
                  <span className="user-status-dot" style={{ background: isBlocked ? "gray" : "" }}></span>
                </div>
                <div className="user-info">
                  <span className="user-name" style={{ textDecoration: isBlocked ? "line-through" : "none" }}>
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

          {otherUsers.length === 0 && (
            <p className="users-empty">Nenhum outro usuário online no momento.</p>
          )}
        </div>
        
        {/* Adicionado o botão para Benefícios */}
        <div className="drawer-footer" style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button 
            className="prof-btn-primary" 
            style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", borderRadius: "12px", border: "none", fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer" }}
            onClick={() => {
              navigate(ROUTES.BENEFITS);
              onClose();
            }}
          >
            <span>✨ Benefícios</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UsersDrawer;