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
  const { messages, currentUser, onlineUsers, sendMessage, roomName, leaveRoom, blockedUsers, toggleBlockUser } = useChat();

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

  return (

    <main className="room">

      <RoomHeader
        roomName={roomName}
        onlineCount={onlineUsers.length}
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
        messages={messages}
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

      <PrivateReplyBar
        selectedUser={selectedUser}
        isPrivateReply={isPrivateReply}
        onTogglePrivate={() => setIsPrivateReply(!isPrivateReply)}
        onCancel={() => setSelectedUser(null)}
      />

      <ChatInput
        selectedUser={selectedUser}
        onSendMessage={handleSendMessage}
      />

      <MyRoomsPopup 
        open={roomsPopupOpen} 
        onClose={() => setRoomsPopupOpen(false)} 
      />

    </main>

  );

}

export default Room;