import "./Room.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useChat } from "../../context/ChatContext";
import { ROUTES } from "../../constants/routes";

import RoomHeader from "../../components/room/RoomHeader/RoomHeader";
import MessageList from "../../components/room/MessageList/MessageList";
import PrivateReplyBar from "../../components/room/PrivateReplyBar/PrivateReplyBar";
import ChatInput from "../../components/room/ChatInput/ChatInput";
import UsersDrawer from "../../components/room/UsersDrawer/UsersDrawer";
import MyRoomsPopup from "../../components/home/MyRoomsPopup/MyRoomsPopup";

function Room() {

  const navigate = useNavigate();
  const { messages, currentUser, onlineUsers, sendMessage, roomName, leaveRoom, blockedUsers, toggleBlockUser, unreadRooms } = useChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isPrivateReply, setIsPrivateReply] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomsPopupOpen, setRoomsPopupOpen] = useState(false);

  function handleSendMessage(data) {
    sendMessage(data.text, {
      private: isPrivateReply && !!data.receiverId,
      targetUser: data.receiverId,
      targetUserName: data.receiverName
    });
  }

  // Filtra msgs para esconder privadas que não são para o usuário atual
  const visibleMessages = messages.filter((m) => {
    if (!m.private) return true;              // msg pública → sempre visível
    if (m.userId === currentUser?.uid) return true;        // eu enviei → vejo
    if (m.targetUser === currentUser?.uid) return true;    // sou o destinatário → vejo
    return false;                             // privada de outros → oculta
  });

  function handleCancelReply() {
    setSelectedUser(null);
    setIsPrivateReply(false);
  }

  return (

    <main className="room">

      <RoomHeader
        roomName={roomName}
        onlineCount={onlineUsers.length}
        unreadCount={unreadRooms?.length || 0}
        onHome={() => navigate(ROUTES.HOME)}
        onUsers={() => setDrawerOpen(true)}
        onRooms={() => setRoomsPopupOpen(true)}
        onLeave={async () => {
          await leaveRoom();
          navigate(ROUTES.HOME);
        }}
      />

      {drawerOpen && (
        <UsersDrawer 
          onlineUsers={onlineUsers} 
          selectedUser={selectedUser}
          blockedUsers={blockedUsers}
          onToggleBlock={toggleBlockUser}
          onSelectUser={(user) => {
            setSelectedUser({ userId: user.id, userName: user.name });
            setIsPrivateReply(true);
            setDrawerOpen(false);
          }}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <MessageList
        messages={visibleMessages}
        currentUserId={currentUser?.uid}
        onSelectUser={(user) => {
          const isOnline = onlineUsers.some(u => u.id === user.userId);
          if (!isOnline) {
            alert("Este usuário não está mais na sala.");
            return;
          }
          setSelectedUser(user);
          setIsPrivateReply(true);
        }}
        selectedUserId={selectedUser?.userId}
      />

      {/* Wrapper que agrupa reply bar + input → sempre no fundo */}
      <div className="chat-input-wrapper">
        <PrivateReplyBar
          selectedUser={selectedUser}
          isPrivateReply={isPrivateReply}
          onTogglePrivate={() => setIsPrivateReply(!isPrivateReply)}
          onCancel={handleCancelReply}
        />

        <ChatInput
          selectedUser={selectedUser}
          onSendMessage={handleSendMessage}
        />
      </div>

      <MyRoomsPopup 
        open={roomsPopupOpen} 
        onClose={() => setRoomsPopupOpen(false)} 
        unreadRooms={unreadRooms}
      />

    </main>

  );

}

export default Room;