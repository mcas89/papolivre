import "./MessageList.css";

import { useRef, useLayoutEffect } from "react";
import MessageItem from "../MessageItem/MessageItem";
import EmptyState from "../EmptyState/EmptyState";

function MessageList({
  messages,
  currentUserId,
  onSelectUser,
  selectedUserId,
  onReportMessage,
}) {
  const scrollRef = useRef(null);
  const isFirstLoad = useRef(true);

  // Scroll para o final quando novas mensagens chegam
  useLayoutEffect(() => {
    if (scrollRef.current && messages && messages.length > 0) {
      // Se for a primeira vez carregando, desce instantâneo
      const behavior = isFirstLoad.current ? "auto" : "smooth";
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      isFirstLoad.current = false;
    }
  }, [messages]);

  return (
    <div className="message-list" ref={scrollRef}>
      {(!messages || messages.length === 0) ? (
        <EmptyState />
      ) : (
        <div className="messages-container">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onSelectUser={onSelectUser}
              selectedUserId={selectedUserId}
              onReportMessage={onReportMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageList;