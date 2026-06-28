import "./MessageList.css";

import { useEffect, useRef } from "react";
import MessageItem from "../MessageItem/MessageItem";
import EmptyState from "../EmptyState/EmptyState";

function MessageList({
  messages,
  currentUserId,
  onSelectUser,
  selectedUserId,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {(!messages || messages.length === 0) ? (
        <EmptyState />
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onSelectUser={onSelectUser}
            selectedUserId={selectedUserId}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;