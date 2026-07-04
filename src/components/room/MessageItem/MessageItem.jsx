import "./MessageItem.css";
import { AlertTriangle, Crown, Lock } from "lucide-react";
import UserAvatar from "../../ui/UserAvatar/UserAvatar";

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

  const avatarData = message.userAvatar;

  if (message.type === "system") {
    return (
      <div className="message-system">
        <span className="message-system-text">{message.text}</span>
      </div>
    );
  }

  if (message.type === "presence") {
    const isEnter = message.text.startsWith("→");
    const isLeave = message.text.startsWith("←");
    const arrowColor = isEnter ? "#10b981" : (isLeave ? "#ef4444" : "inherit");
    
    return (
      <div className="message-presence">
        <span className="message-presence-text">
          <span style={{ color: arrowColor, fontWeight: "bold", marginRight: "4px" }}>
            {message.text.charAt(0)}
          </span>
          {message.text.substring(1)}
        </span>
      </div>
    );
  }

  if (message.type === "gift") {
    return (
      <div className="message-system gift-message">
        <span className="message-system-text gift-text">{message.text}</span>
      </div>
    );
  }

  return (

    <div className={`message-wrapper ${isMine ? "mine" : ""} ${isPrivate ? "private" : ""} ${isMyDirectMessage ? "active-conversation" : ""} ${isTargetingMe ? "directed-to-me" : ""}`}>

      <div 
        className="message-avatar-wrap"
        onClick={!isMine ? handleSelectUser : undefined}
        title={!isMine ? "Responder no privado" : ""}
      >
        <UserAvatar 
          avatarData={avatarData} 
          fallbackUid={message.userId} 
          size={36} 
          className="message-avatar"
        />
      </div>

      <div className="message-bubble">

        <div className="message-header">
          <span className="message-name">
            {!!(message.userPremium || (message.userAvatar && typeof message.userAvatar === 'object' && message.userAvatar.premium)) && (
              <span className="msg-premium-icon">
                <Crown size={14} />
              </span>
            )}
            {message.userName}
            {isPrivate && hasTarget && (
              <>
                <span className="msg-private-lock">
                  <Lock size={12} />
                </span>
                {message.targetUserName}
              </>
            )}
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

      </div>

    </div>

  );

}

export default MessageItem;