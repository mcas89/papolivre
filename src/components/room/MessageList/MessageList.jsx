import "./MessageList.css";

import { Virtuoso } from "react-virtuoso";
import MessageItem from "../MessageItem/MessageItem";
import EmptyState from "../EmptyState/EmptyState";

function MessageList({
  messages,
  currentUserId,
  onSelectUser,
  selectedUserId,
  onReportMessage,
}) {
  return (
    <div className="message-list">
      {(!messages || messages.length === 0) ? (
        <EmptyState />
      ) : (
        <Virtuoso
          className="virtuoso-message-list"
          style={{ height: '100%' }}
          data={messages}
          initialTopMostItemIndex={messages.length - 1}
          followOutput="smooth"
          atBottomThreshold={200}
          components={{
            Footer: () => <div style={{ height: '150px' }} />
          }}
          itemContent={(index, message) => (
            <MessageItem
              key={message.id || index}
              message={message}
              currentUserId={currentUserId}
              onSelectUser={onSelectUser}
              selectedUserId={selectedUserId}
              onReportMessage={onReportMessage}
            />
          )}
        />
      )}
    </div>
  );
}

export default MessageList;