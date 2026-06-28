import "./MyRoomsPopup.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, Loader2 } from "lucide-react";

import roomService from "../../../services/roomService";
import { useChat } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../constants/routes";
import PremiumLimitModal from "../../ui/PremiumLimitModal/PremiumLimitModal";

function MyRoomsPopup({ open, onClose }) {

  const navigate                    = useNavigate();
  const { joinRoom, currentRoom, onlineUsers } = useChat();
  const { user }                    = useAuth();

  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para modal de limite/premium
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalType, setLimitModalType] = useState("rooms");

  // Busca salas do Firestore ao abrir o popup
  useEffect(() => {

    if (!open) return;

    setLoading(true);

    roomService.getRooms()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [open]);

  if (!open) return null;

  // Filtra apenas as salas que o usuário está conectado
  const connectedRoomIds = user?.connectedRooms || [];
  const connectedRooms = connectedRoomIds.map(id => {
    if (id === "pessoas_proximas") {
      const isCurrentGeo = currentRoom?.startsWith("geo_");
      return {
        id: "pessoas_proximas",
        icon: "📍",
        name: "Pessoas Próximas",
        description: "Pessoas na sua região",
        online: isCurrentGeo ? onlineUsers.length : 0 // só sabemos o online exato se for a sala atual
      };
    }
    return rooms.find(r => r.id === id);
  }).filter(Boolean);

  async function handleEnterRoom(room) {
    const res = await joinRoom(room.id);
    if (!res.success) {
      if (res.error === "LIMITE_SALAS") {
        setLimitModalType("rooms");
        setLimitModalOpen(true);
      } else if (res.error === "SALA_CHEIA") {
        setLimitModalType("full");
        setLimitModalOpen(true);
      }
      return;
    }
    onClose();
    navigate(ROUTES.ROOM);
  }

  return (

    <>

      <div
        className="rooms-overlay"
        onClick={onClose}
      />

      <div className="rooms-popup">

        <PremiumLimitModal
          open={limitModalOpen}
          onClose={() => setLimitModalOpen(false)}
          type={limitModalType}
        />

        <div className="popup-header">

          <div>

            <h2>Minhas Salas</h2>

            <span>
              {loading
                ? "Carregando..."
                : `Conectado em ${connectedRooms.length} sala${connectedRooms.length !== 1 ? "s" : ""}`
              }
            </span>

          </div>

          <button onClick={onClose}>
            <X size={20} />
          </button>

        </div>

        <div className="popup-list">

          {loading && (
            <div className="popup-loading">
              <Loader2 size={22} className="spin" />
              <span>Buscando suas salas...</span>
            </div>
          )}

          {!loading && connectedRooms.map((room) => {
            const isActive = currentRoom === room.id || (room.id === "pessoas_proximas" && currentRoom?.startsWith("geo_"));
            
            return (
            <button
              key={room.id}
              className={`popup-room ${isActive ? "popup-room--active" : ""}`}
              onClick={() => handleEnterRoom(room)}
            >

              <div className="room-top">

                <div className="room-name">
                  <span className="room-icon">{room.icon}</span>
                  <strong>{room.name}</strong>
                </div>

                {isActive && (
                  <span className="badge badge--active">Atual</span>
                )}

              </div>

              <p>{room.description}</p>

              <div className="room-bottom">

                <small>
                  🟢 {room.online ?? 0} online
                </small>

                <ChevronRight size={18} />

              </div>

            </button>
            );
          })}

          {!loading && connectedRooms.length === 0 && (
            <p className="popup-empty">Você não está conectado a nenhuma sala.</p>
          )}

        </div>

      </div>

    </>

  );

}

export default MyRoomsPopup;