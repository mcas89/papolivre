import "./PrivateReplyBar.css";

import { Lock, Unlock, X } from "lucide-react";

function PrivateReplyBar({
  selectedUser,
  isPrivateReply,
  onTogglePrivate,
  onCancel,
}) {
  if (!selectedUser) return null;

  return (
    <div className="reply-bar">

      <div className="reply-info">
        <button className="toggle-private-btn" onClick={onTogglePrivate} title={isPrivateReply ? "Mudar para público" : "Mudar para privado"}>
          {isPrivateReply ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <span>
          Responder a <strong>{selectedUser.userName}</strong>
        </span>
      </div>

      <button
        className="reply-close"
        onClick={onCancel}
      >
        <X size={16} />
      </button>

    </div>
  );
}

export default PrivateReplyBar;