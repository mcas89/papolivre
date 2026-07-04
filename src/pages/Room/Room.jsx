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
import EffectsLayer from "../../components/room/EffectsLayer/EffectsLayer";
import PublicGiftsLayer from "../../components/room/PublicGiftsLayer/PublicGiftsLayer";
import Button from "../../components/ui/Button/Button";
import reportService from "../../services/reportService";
import { useToast } from "../../context/ToastContext";

function Room() {

  const navigate = useNavigate();
  const { messages, currentUser, onlineUsers, sendMessage, roomName, leaveRoom, blockedUsers, toggleBlockUser, unreadRooms, currentRoom } = useChat();
  const { showToast } = useToast();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isPrivateReply, setIsPrivateReply] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomsPopupOpen, setRoomsPopupOpen] = useState(false);

  const [messageToReport, setMessageToReport] = useState(null);
  const [isReporting, setIsReporting] = useState(false);

  function handleSendMessage(data) {
    console.log("TARGET USER", selectedUser);
    const messageData = {
      private: isPrivateReply && !!data.receiverId,
      targetUser: data.receiverId,
      targetUserName: data.receiverName
    };
    console.log("MESSAGE DATA", messageData);
    sendMessage(data.text, messageData);
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

  async function handleConfirmReport(reason) {
    if (!messageToReport || !currentUser) return;
    setIsReporting(true);
    try {
      await reportService.createReport({
        reportedUser: messageToReport.userId,
        reportedMessage: messageToReport.text,
        reportedBy: currentUser.uid,
        roomId: currentRoom || "unknown",
        reason
      });
      showToast("Denúncia enviada com sucesso. Obrigado por ajudar a manter a comunidade segura.", "success");
    } catch (err) {
      showToast("Erro ao enviar denúncia. Tente novamente.", "error");
    } finally {
      setIsReporting(false);
      setMessageToReport(null);
    }
  }

  return (

    <main className="room">
      <EffectsLayer roomId={currentRoom} />
      <PublicGiftsLayer roomId={currentRoom} />

      <RoomHeader
        roomId={currentRoom}
        roomName={roomName}
        onlineCount={onlineUsers.length}
        unreadCount={Object.values(unreadRooms).reduce((sum, cnt) => sum + cnt, 0)}
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
          currentUserId={currentUser?.uid}
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
            showToast("Este usuário não está mais na sala.", "error");
            return;
          }
          setSelectedUser(user);
          setIsPrivateReply(true);
        }}
        selectedUserId={selectedUser?.userId}
        onReportMessage={(msg) => setMessageToReport(msg)}
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
          isPrivateReply={isPrivateReply}
          onSendMessage={handleSendMessage}
        />
      </div>

      <MyRoomsPopup 
        open={roomsPopupOpen} 
        onClose={() => setRoomsPopupOpen(false)} 
        unreadRooms={unreadRooms}
      />

      {/* MODAL DE DENÚNCIA SIMPLES */}
      {messageToReport && (
        <>
          <div className="anon-modal-overlay" onClick={() => !isReporting && setMessageToReport(null)} />
          <div className="anon-modal">
            <div className="anon-modal-header">
              <h2>Denunciar Mensagem</h2>
              <p>Qual o motivo da denúncia?</p>
            </div>
            
            <div className="anon-modal-actions" style={{ flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <Button onClick={() => handleConfirmReport("Spam / Propagandas")} variant="outline" full disabled={isReporting}>
                Spam / Propagandas
              </Button>
              <Button onClick={() => handleConfirmReport("Ofensa / Assédio")} variant="outline" full disabled={isReporting}>
                Ofensa / Assédio
              </Button>
              <Button onClick={() => handleConfirmReport("Conteúdo Inadequado")} variant="outline" full disabled={isReporting}>
                Conteúdo Inadequado
              </Button>
              <button 
                type="button" 
                className="btn-cancel-anon" 
                onClick={() => setMessageToReport(null)}
                disabled={isReporting}
                style={{ marginTop: "10px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}

    </main>

  );

}

export default Room;