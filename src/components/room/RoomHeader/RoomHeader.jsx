import "./RoomHeader.css";

import React, { useState, useEffect } from "react";
import {
  House,
  Users,
  MessageCircle,
  LogOut,
  Clock,
  AlertTriangle,
  Flame,
  RefreshCw
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import roomService from "../../../services/roomService";
import { useToast } from "../../../context/ToastContext";

function RoomHeader({
  roomId,
  roomName = "Pessoas Próximas",
  onlineCount = 0,
  onHome,
  onUsers,
  onRooms,
  onLeave,
  unreadCount = 0,
}) {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!roomId || roomId.startsWith("geo_") || roomId === "geral") {
      setRoomData(null);
      return;
    }
    const fetchRoom = async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", roomId));
        if (snap.exists()) setRoomData(snap.data());
      } catch (err) {
        console.error("Erro ao buscar dados da sala", err);
      }
    };
    fetchRoom();
  }, [roomId]);

  let daysRemaining = null;
  if (roomData?.isCustom && roomData?.expiresAt) {
    const expTime = roomData.expiresAt.toMillis ? roomData.expiresAt.toMillis() : new Date(roomData.expiresAt).getTime();
    daysRemaining = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const isOwner = user && roomData && roomData.ownerId === user.uid;
  const isPremium = !!user?.isPremium;

  async function handleRenew() {
    if (!isOwner) return;
    if (!isPremium && (user.credits || 0) < 8) {
      showToast("Você não possui créditos suficientes. (8 Créditos)", "error");
      return;
    }
    
    setIsRenewing(true);
    try {
      const newExp = await roomService.renewCustomRoom(roomId, user, isPremium);
      showToast("Sala renovada com sucesso por mais 7 dias!", "success");
      setRoomData({ ...roomData, expiresAt: newExp });
    } catch (err) {
      showToast("Erro ao renovar sala: " + err.message, "error");
    } finally {
      setIsRenewing(false);
    }
  }

  return (
    <header className="room-header">

      <button
        className="icon-button"
        onClick={onHome}
      >
        <House size={20} />
      </button>

      <div className="room-title">
        <div className="room-name-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="room-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {roomName}
            {roomData?.isCustom && daysRemaining !== null && (
               <div style={{ 
                 display: 'flex', alignItems: 'center', gap: '4px', 
                 fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                 background: 'rgba(0,0,0,0.3)',
                 color: daysRemaining <= 0 ? '#ef4444' : (daysRemaining === 1 ? '#f59e0b' : '#3b82f6')
               }}>
                 {daysRemaining <= 0 ? <Flame size={10} /> : (daysRemaining === 1 ? <AlertTriangle size={10} /> : <Clock size={10} />)}
                 {daysRemaining <= 0 ? "Expira hoje" : (daysRemaining === 1 ? "Expira amanhã" : `${daysRemaining} dias`)}
               </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            <span><span className="status-dot"></span>{onlineCount} online</span>
            
            {roomData?.isCustom && roomData?.ownerName && (
              <span>• Criada por {roomData.ownerName}</span>
            )}
            
            {isOwner && (
              <button 
                onClick={handleRenew} 
                disabled={isRenewing}
                style={{ 
                  background: 'none', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#f59e0b', 
                  borderRadius: '4px', padding: '0 4px', fontSize: '0.65rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '2px'
                }}
              >
                <RefreshCw size={8} /> {isRenewing ? "..." : "Renovar"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="room-actions">

        <button
          className="icon-button"
          onClick={onUsers}
        >
          <Users size={20} />
        </button>

        <button
          className="icon-button"
          onClick={onRooms}
          style={{ position: "relative" }}
        >
          <MessageCircle size={20} />
          {unreadCount > 0 && (
            <span className="badge-notification" style={{ top: -2, right: -2 }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          className="icon-button logout"
          onClick={onLeave}
        >
          <LogOut size={20} />
        </button>

      </div>

    </header>
  );
}

export default RoomHeader;