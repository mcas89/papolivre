import "./ChatInput.css";

import { useState } from "react";
import { SendHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../../context/ChatContext";
import effectService from "../../../services/effectService";
import { EFFECTS_CATALOG } from "../../../constants/effectConstants";
import giftService from "../../../services/giftService";
import { GIFTS_CATALOG } from "../../../constants/giftConstants";

function ChatInput({
  selectedUser,
  isPrivateReply,
  onSendMessage,
}) {

  const [text, setText] = useState("");
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showGiftsPanel, setShowGiftsPanel] = useState(false);
  const [toastError, setToastError] = useState(null);
  
  const { currentRoom, currentUser } = useChat();
  const navigate = useNavigate();

  const activeEffects = EFFECTS_CATALOG.filter(e => e.active);
  const isPremium = currentUser?.isPremium || false;
  const isAnonymous = currentUser?.isAnonymous || currentUser?.anonymous || false;
  const now = Date.now();
  const hasPass = currentUser?.effectsPassUntil?.toMillis 
    ? currentUser.effectsPassUntil.toMillis() > now 
    : (currentUser?.effectsPassUntil > now);

  const handleSendEffect = async (effect) => {
    // Bloqueio local visual se não for premium
    if (effect.premiumOnly && !isPremium) {
      setToastError({ message: "⭐ Este efeito é exclusivo do Premium Pro.", isPremiumAd: true });
      setTimeout(() => setToastError(null), 5000);
      return;
    }

    if (effect.requiresPass && !isPremium && !hasPass) {
      setToastError({ message: "Para usar, compre o Passe de Efeitos (3 Moedas) na tela de Benefícios!", isPremiumAd: true });
      setTimeout(() => setToastError(null), 5000);
      return;
    }

    // Bloqueio local visual para anônimos nos efeitos gratuitos
    if (!effect.premiumOnly && !effect.requiresPass && isAnonymous) {
      setToastError({ message: "Crie uma conta grátis para usar efeitos!", isPremiumAd: false });
      setTimeout(() => setToastError(null), 3000);
      return;
    }

    try {
      await effectService.sendEffect(
        currentRoom, 
        effect.id, 
        currentUser, 
        (isPrivateReply && selectedUser) ? selectedUser.userId : null,
        (isPrivateReply && selectedUser) ? selectedUser.userName : null
      );
      setShowEffectsPanel(false);
    } catch (err) {
      setToastError({ message: err.message, isPremiumAd: false });
      setTimeout(() => setToastError(null), 3000);
    }
  };

  const handleSendGift = async (gift) => {
    if (isAnonymous) {
      setToastError({ message: "Crie uma conta gratuita para utilizar o sistema de presentes do PapoLivre.", isPremiumAd: false });
      setTimeout(() => setToastError(null), 3000);
      return;
    }

    const isPrivate = (isPrivateReply && selectedUser);

    try {
      if (isPrivate) {
        await giftService.sendPrivateGift(
          currentRoom,
          currentUser,
          selectedUser.userId,
          selectedUser.userName,
          gift.id
        );
      } else {
        await giftService.dropPublicGift(
          currentRoom,
          currentUser,
          gift.id
        );
      }
      setShowGiftsPanel(false);
    } catch (err) {
      setToastError({ message: err.message, isPremiumAd: false });
      setTimeout(() => setToastError(null), 3000);
    }
  };

  function handleSend() {

    const message = text.trim();

    if (!message) return;

    onSendMessage({
      text: message,
      receiverId: selectedUser?.userId || null,
      receiverName: selectedUser?.userName || null,
    });

    setText("");

  }

  function handleKeyDown(e) {

    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }

  }

  return (
    <div className="chat-input-container" style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      
      {/* Toast Local para Erros de Efeitos */}
      {toastError && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '16px',
          background: toastError.isPremiumAd ? 'rgba(30, 20, 50, 0.95)' : 'rgba(220, 38, 38, 0.95)',
          border: toastError.isPremiumAd ? '1px solid #FFD700' : 'none',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: '500',
          zIndex: 101,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastError.message}</span>
          {toastError.isPremiumAd && (
            <button 
              onClick={() => navigate('/premium')}
              style={{
                background: '#FFD700',
                color: '#000',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
              Conhecer Premium
            </button>
          )}
        </div>
      )}

      {showEffectsPanel && (
        <div className="effects-panel" style={{
          position: 'absolute',
          bottom: '100%',
          left: '16px',
          marginBottom: '8px',
          padding: '12px',
          background: 'rgba(20, 10, 30, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 100,
          minWidth: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Efeitos Especiais</span>
            <button type="button" onClick={() => setShowEffectsPanel(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', justifyContent: 'center' }}>
            {activeEffects.map(effect => {
              const isPremiumLocked = effect.premiumOnly && !isPremium;
              const isPassLocked = effect.requiresPass && !isPremium && !hasPass;
              const isAnonymousLocked = !effect.premiumOnly && !effect.requiresPass && isAnonymous;
              const isLocked = isPremiumLocked || isPassLocked || isAnonymousLocked;
              return (
                <button
                  key={effect.id}
                  type="button"
                  onClick={() => handleSendEffect(effect)}
                  title={effect.name}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    position: 'relative',
                    opacity: isLocked ? 0.5 : 1,
                    filter: isLocked ? 'grayscale(100%)' : 'none'
                  }}
                  onMouseOver={(e) => !isLocked && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  onMouseOut={(e) => !isLocked && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  {effect.id === "coracao" && "❤️"}
                  {effect.id === "mandandobeijo" && "😘"}
                  {effect.id === "dedo" && "🖕"}
                  {effect.id === "linguasensual" && "👅"}
                  {effect.id === "soco" && "👊"}
                  {effect.id === "noelpum" && "🎅"}

                  {isPremiumLocked && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      background: '#FFD700',
                      color: '#000',
                      fontSize: '0.6rem',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>PRO</span>
                  )}
                  {isPassLocked && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      background: '#8b5cf6',
                      color: '#fff',
                      fontSize: '0.5rem',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap'
                    }}>🔒 COMPRAR</span>
                  )}
                  {isAnonymousLocked && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      background: '#666',
                      color: '#fff',
                      fontSize: '0.5rem',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap'
                    }}>ENTRE</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showGiftsPanel && (
        <div className="gifts-panel" style={{
          position: 'absolute',
          bottom: '100%',
          left: '56px',
          marginBottom: '8px',
          padding: '12px',
          background: 'rgba(20, 10, 30, 0.95)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 100,
          minWidth: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Presentes</span>
            <button type="button" onClick={() => setShowGiftsPanel(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {GIFTS_CATALOG.map(gift => (
              <button
                key={gift.id}
                type="button"
                onClick={() => handleSendGift(gift)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  color: '#fff'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{gift.icon}</span>
                  <span>{gift.name}</span>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {gift.cost} Coins
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input" style={{ position: 'relative' }}>
        
        {/* Botão de Efeitos */}
        <button
          type="button"
          className="effect-toggle-btn"
          onClick={() => {
            setShowEffectsPanel(!showEffectsPanel);
            setShowGiftsPanel(false);
          }}
          style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', padding: '0 8px', cursor: 'pointer', opacity: 0.8, boxShadow: 'none' }}
          title="Efeitos"
        >
          🎉
        </button>

        {/* Botão de Presentes */}
        <button
          type="button"
          className="gift-toggle-btn"
          onClick={() => {
            if (isAnonymous) {
              setToastError({ message: "Crie uma conta gratuita para utilizar o sistema de presentes do PapoLivre.", isPremiumAd: false });
              setTimeout(() => setToastError(null), 3000);
              return;
            }
            setShowGiftsPanel(!showGiftsPanel);
            setShowEffectsPanel(false);
          }}
          style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', padding: '0 8px', cursor: 'pointer', opacity: 0.8, boxShadow: 'none' }}
          title="Presentes"
        >
          🎁
        </button>

        <input
        type="text"
        placeholder={
          selectedUser
            ? `Mensagem privada para ${selectedUser.userName}`
            : "Digite uma mensagem..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSend}
        disabled={!text.trim()}
      >
        <SendHorizontal size={20} />
      </button>

    </div>
    </div>

  );

}

export default ChatInput;