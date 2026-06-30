import "./MessageItem.css";
import { AlertTriangle } from "lucide-react";

function formatTime(timestamp) {

  const date = new Date(timestamp);

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

}

function MessageItem({
  message,
  currentUserId,
  onSelectUser,
  selectedUserId,
  onReportMessage,
}) {

  const isMine = message.userId === currentUserId;
  const isPrivate = message.private;
  const hasTarget = !!message.targetUser;
  const isTargetingMe = message.targetUser === currentUserId;
  const isMyDirectMessage = isMine && hasTarget;

  function handleSelectUser() {

    onSelectUser({
      userId: message.userId,
      userName: message.userName,
    });

  }

  const avatar = message.userAvatar || `https://i.pravatar.cc/150?u=${message.userId}`;
  const isEmoji = avatar && !avatar.startsWith("http") && !avatar.startsWith("data:") && !avatar.startsWith("/");

  if (message.type === "system") {
    return (
      <div className="message-system">
        <span className="message-system-text">{message.text}</span>
      </div>
    );
  }

  return (

    <div className={`message-wrapper ${isMine ? "mine" : ""} ${isPrivate ? "private" : ""} ${isMyDirectMessage ? "active-conversation" : ""} ${isTargetingMe ? "directed-to-me" : ""}`}>

      {isEmoji ? (
        <div 
          className="message-avatar emoji-avatar"
          onClick={!isMine ? handleSelectUser : undefined}
          title={!isMine ? "Responder no privado" : ""}
        >
          {avatar}
        </div>
      ) : (
        <img 
          src={avatar} 
          alt={message.userName} 
          className="message-avatar" 
          onClick={!isMine ? handleSelectUser : undefined}
          title={!isMine ? "Responder no privado" : ""}
        />
      )}

      <div className="message-bubble">

        <div className="message-header">
          <span className="message-name">
            {hasTarget ? `${message.userName} 📢 ${message.targetUserName}` : `${message.userName} 📢 todos`}
          </span>
          <div className="message-header-right">
            <span className="message-time">
              {formatTime(message.createdAt || message.timestamp)}
            </span>
            {!isMine && (
              <button 
                className="report-btn" 
                onClick={() => onReportMessage(message)}
                title="Denunciar mensagem"
              >
                <AlertTriangle size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="message-body">
          {message.text}
        </div>

        {isPrivate && (
          <div className="message-footer">
            <span className="private-tag">🔒 Privado</span>
          </div>
        )}

      </div>

    </div>

  );

}

export default MessageItem;