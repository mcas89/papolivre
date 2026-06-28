import "./ChatInput.css";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

function ChatInput({
  selectedUser,
  onSendMessage,
}) {

  const [text, setText] = useState("");

  function handleSend() {

    const message = text.trim();

    if (!message) return;

    onSendMessage({
      text: message,
      receiverId: selectedUser?.userId || null,
      receiverName: selectedUser?.userName || null,
    });

    setText("");

  }

  function handleKeyDown(e) {

    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }

  }

  return (

    <div className="chat-input">

      <input
        type="text"
        placeholder={
          selectedUser
            ? `Mensagem privada para ${selectedUser.userName}`
            : "Digite uma mensagem..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSend}
        disabled={!text.trim()}
      >
        <SendHorizontal size={20} />
      </button>

    </div>

  );

}

export default ChatInput;