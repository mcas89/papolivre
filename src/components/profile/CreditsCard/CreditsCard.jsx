import "./CreditsCard.css";
import { Coins, Crown, MessageCircleHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useToast } from "../../../context/ToastContext";

function CreditsCard({ user }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleActivatePro = async () => {
    if (!user?.uid || (user.credits || 0) <= 0) return;

    try {
      const currentProUntil = user.isPremium && user.proUntil ? user.proUntil.toMillis() : Date.now();
      const newProUntilMillis = currentProUntil + 7 * 24 * 60 * 60 * 1000;

      await updateDoc(doc(db, "users", user.uid), {
        credits: user.credits - 1,
        proUntil: Timestamp.fromMillis(newProUntilMillis)
      });
      showToast("Premium PRO ativado por 7 dias! 🎉", "success");
    } catch (err) {
      console.error("Erro ao ativar premium:", err);
      showToast("Erro ao ativar. Tente novamente.", "error");
    }
  };

  const credits = user?.credits || 0;
  const isPremium = user?.isPremium;
  
  // Format expiration date if it exists
  let proExpirationDate = "";
  if (isPremium && user?.proUntil) {
    const date = new Date(user.proUntil.toMillis());
    proExpirationDate = date.toLocaleDateString("pt-BR", { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  }

  return (
    <div className="credits-card">
      <div className="credits-header">
        <h3>Sua Carteira</h3>
        <div className="credits-balance">
          <Coins size={20} className="credits-icon" />
          <span>{credits}</span>
        </div>
      </div>

      <div className="credits-body">
        {isPremium ? (
          <div className="pro-active-status">
            <Crown size={24} className="pro-crown-active" />
            <p>Você é <strong>Premium PRO</strong></p>
            <small>Válido até: {proExpirationDate}</small>
          </div>
        ) : (
          <div className="pro-inactive-status">
            <p>Atualmente você é usuário Grátis.</p>
            <small>Limite de 3 salas.</small>
          </div>
        )}

        {credits > 0 && !isPremium && (
          <div className="ready-for-pro">
            <p>🎉 Você tem créditos suficientes!</p>
            <button 
              className="btn-activate-pro"
              onClick={handleActivatePro}
            >
              Ativar Premium PRO
            </button>
          </div>
        )}

        {credits === 0 && (
          <div className="get-credits">
            <p>Quer mais vantagens e acessar até 5 salas?</p>
            <a 
              href="https://t.me/fake_telegram_account" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-telegram"
            >
              <MessageCircleHeart size={18} />
              Adquirir Créditos (Telegram)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreditsCard;
