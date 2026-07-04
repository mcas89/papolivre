import React, { useState, useEffect } from "react";
import { X, Clock, AlertTriangle } from "lucide-react";
import roomService from "../../../services/roomService";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useSystem } from "../../../context/SystemContext";
import "./RenewRoomModal.css";

function RenewRoomModal({ isOpen, onClose }) {
  const { user, isPremium } = useAuth();
  const { settings } = useSystem();
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      loadMyRooms();
    }
  }, [isOpen, user]);

  async function loadMyRooms() {
    setLoading(true);
    try {
      const rooms = await roomService.getMyCustomRooms(user.uid);
      setMyRooms(rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const cost = isPremium ? "GRÁTIS" : `${settings.renewRoomPrice} Créditos`;

  async function handleRenew(room) {
    if (!isPremium && (user.credits || 0) < settings.renewRoomPrice) {
      showToast(`Você não possui créditos suficientes. Requer ${settings.renewRoomPrice}.`, "error");
      return;
    }

    setRenewingId(room.id);
    try {
      await roomService.renewCustomRoom(room.id, user, isPremium);
      showToast(`Sala ${room.name} renovada com sucesso por mais 7 dias!`, "success");
      loadMyRooms();
    } catch (err) {
      showToast("Erro ao renovar sala: " + err.message, "error");
    } finally {
      setRenewingId(null);
    }
  }

  function getDaysRemaining(expiresAt) {
    if (!expiresAt) return 0;
    const expTime = expiresAt.toMillis ? expiresAt.toMillis() : new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = expTime - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="renew-room-overlay">
      <div className="renew-room-modal">
        <button className="renew-room-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="renew-room-header">
          <Clock className="renew-room-icon" size={24} />
          <h2>Renovar Salas</h2>
        </div>
        <p className="renew-room-subtitle">
          Gerencie o tempo de vida das suas salas. Custo: <strong>{cost}</strong> por sala.
        </p>

        {loading ? (
          <p className="wallet-empty">Carregando suas salas...</p>
        ) : myRooms.length === 0 ? (
          <p className="wallet-empty">Você ainda não criou nenhuma sala.</p>
        ) : (
          <div className="renew-room-list">
            {myRooms.map(room => {
              const days = getDaysRemaining(room.expiresAt);
              const isExpired = days <= 0;
              
              return (
                <div key={room.id} className={`renew-room-card ${isExpired ? "expired" : ""}`}>
                  <div className="renew-room-info">
                    <h3>{room.icon} {room.name}</h3>
                    <p style={{ color: isExpired ? '#ef4444' : (days === 1 ? '#f59e0b' : 'rgba(255,255,255,0.6)') }}>
                      {isExpired ? "Expirada" : (days === 1 ? "Expira hoje/amanhã" : `Restam ${days} dias`)}
                    </p>
                  </div>
                  <button 
                    className="renew-room-btn"
                    disabled={renewingId === room.id}
                    onClick={() => handleRenew(room)}
                  >
                    {renewingId === room.id ? "Renovando..." : "Renovar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RenewRoomModal;
