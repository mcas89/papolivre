import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useChat } from "../../../context/ChatContext";
import giftService from "../../../services/giftService";
import { GIFTS_CATALOG } from "../../../constants/giftConstants";
import { useToast } from "../../../context/ToastContext";
import "./PublicGiftsLayer.css";

function PublicGiftsLayer({ roomId }) {
  const [activeGifts, setActiveGifts] = useState([]);
  const { currentUser } = useChat();
  const { showToast } = useToast();

  useEffect(() => {
    if (!roomId) return;

    // Escuta presentes públicos na sala atual que ainda estão como 'dropped'
    const q = query(
      collection(db, "gifts"),
      where("roomId", "==", roomId),
      where("status", "==", "dropped")
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const now = Date.now();
        const gifts = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const expiresTime = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : new Date(data.expiresAt).getTime();
          
          // Verifica se ainda não expirou (damos 1 segundo de lambuja para sincronia)
          if (expiresTime && now <= expiresTime + 1000) {
            gifts.push({ id: doc.id, ...data, expiresTime });
          }
        });
        setActiveGifts(gifts);
      },
      (err) => {
        console.warn("Firestore presentes públicos - Permissão Negada ou Erro:", err);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // Loop para remover os presentes visualmente se o tempo passar de 10s e o onSnapshot não atualizar
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveGifts((prev) => prev.filter((g) => now <= g.expiresTime));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (giftId) => {
    if (!currentUser || currentUser.isAnonymous || currentUser.anonymous) {
      showToast("Crie uma conta gratuita para receber presentes.", "info");
      return;
    }
    
    try {
      await giftService.claimPublicGift(giftId, currentUser);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (activeGifts.length === 0) return null;

  return (
    <div className="public-gifts-layer" style={{ pointerEvents: 'none' }}>
      {activeGifts.map((gift) => {
        const giftDef = GIFTS_CATALOG.find((g) => g.id === gift.giftType);
        if (!giftDef) return null;

        return (
          <div key={gift.id} className="public-gift-card" style={{ pointerEvents: 'auto' }}>
            <div className="gift-card-header">
              <span>🎁</span>
              <span>{gift.senderName} deixou um presente.</span>
            </div>
            <div className="gift-card-body">
              <span className="gift-card-icon">{giftDef.icon}</span>
              <span className="gift-card-name">{giftDef.name}</span>
            </div>
            {currentUser?.uid !== gift.senderId ? (
              <button className="gift-card-btn" onClick={() => handleClaim(gift.id)}>
                Receber
              </button>
            ) : (
              <button className="gift-card-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Seu Presente
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PublicGiftsLayer;
