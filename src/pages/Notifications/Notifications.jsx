import "./Notifications.css";
import { Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <h2>Notificações Globais</h2>
      </header>

      <div className="notifications-content">
        <div className="empty-notifications">
          <div className="icon-wrapper">
            <Bell size={48} className="bell-icon" />
            <span className="pulse-ring"></span>
          </div>
          <h3>Em Breve!</h3>
          <p>Esta área será usada para anúncios e mensagens globais para todos os usuários. Fique ligado nas próximas novidades!</p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;