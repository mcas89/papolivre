import "./PremiumLimitModal.css";
import { Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";

function PremiumLimitModal({ open, onClose, type }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!open) return null;

  const isRoomLimit = type === "rooms";
  const isPremium = !!user?.isPremium;

  const handleBecomePremium = () => {
    onClose();
    navigate(ROUTES.PREMIUM);
  };

  return (
    <>
      <div className="premium-modal-overlay" onClick={onClose} />
      <div className="premium-modal">
        <button className="premium-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!(isRoomLimit && isPremium) && (
          <div className="premium-modal-header">
            <div className="premium-crown-glow">
              <Crown size={32} className="premium-modal-crown" />
            </div>
          </div>
        )}

        <div className="premium-modal-body">
          {isRoomLimit ? (
            isPremium ? (
              <p style={{ fontSize: "16px", fontWeight: "600", margin: "20px 0", color: "#ffffff" }}>
                Você já atingiu o limite de 5 salas simultâneas do Premium Pro.
              </p>
            ) : (
              <>
                <h3>Limite de Salas Atingido</h3>
                <p>
                  Você atingiu o limite máximo de <strong>3 salas conectadas simultaneamente</strong>.
                </p>
                <p className="premium-modal-highlight">
                  Assine o <strong>Premium Pro</strong> para se conectar a salas ilimitadas!
                </p>
              </>
            )
          ) : (
            <>
              <h3>Sala de Conversa Lotada</h3>
              <p>
                Esta sala de Pessoas Próximas atingiu o limite de <strong>100 usuários comuns</strong>.
              </p>
              <p className="premium-modal-highlight">
                Assine o <strong>Premium Pro</strong> para ter acesso estendido a salas cheias de até <strong>130 participantes</strong>!
              </p>
            </>
          )}
        </div>

        <div className="premium-modal-footer">
          {isRoomLimit && isPremium ? (
            <button className="btn-cancel-premium" onClick={onClose} style={{ width: "100%" }}>
              Fechar
            </button>
          ) : (
            <>
              <button className="btn-become-premium" onClick={handleBecomePremium}>
                Seja Premium Pro
              </button>
              <button className="btn-cancel-premium" onClick={onClose}>
                Talvez mais tarde
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default PremiumLimitModal;

