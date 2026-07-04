import { useState } from "react";
import { ArrowLeft, Crown, CheckCircle, Sparkles, MessageCircle, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";
import { db } from "../../firebase/config";
import { doc, Timestamp } from "firebase/firestore";
import creditService from "../../services/creditService";
import { CREDIT_REASON, TRANSACTION_SOURCE } from "../../constants/creditConstants";
import { useToast } from "../../context/ToastContext";
import "./Premium.css";

function Premium() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSystem();
  const credits = user?.credits || 0;
  const isAnonymous = !!(user?.anonymous || user?.isAnonymous);
  const [activating, setActivating] = useState(false);
  const { showToast } = useToast();

  const isPremium = !!user?.isPremium;
  const proUntil = user?.proUntil ? new Date(user.proUntil.toMillis()) : null;

  async function handleRegisterClick() {
    await logout();
    navigate(ROUTES.QUICK_REGISTER);
  }

  async function handleActivatePro() {
    if (!user?.uid) return;
    if (credits < settings.premiumPrice) {
      showToast(`Você precisa de ${settings.premiumPrice} créditos para assinar.`, "error");
      return;
    }

    setActivating(true);
    try {
      const base = isPremium && user.proUntil ? user.proUntil.toMillis() : Date.now();
      await creditService.removeCredits(
        user.uid,
        settings.premiumPrice,
        CREDIT_REASON.PURCHASE_PREMIUM,
        TRANSACTION_SOURCE.USER,
        {
          proUntil: Timestamp.fromMillis(base + 7 * 24 * 60 * 60 * 1000),
        }
      );
      showToast("Premium PRO ativado com sucesso! Bem-vindo à área VIP.", "success");
    } catch (err) {
      console.error(err);
      if (err.message === "SALDO_INSUFICIENTE") {
        showToast("Você não possui saldo suficiente.", "error");
      } else {
        showToast("Erro ao ativar Premium. Tente novamente.", "error");
      }
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="premium-page">
      <div className="premium-bg">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`bubble bubble-${i + 1}`} />
        ))}
      </div>

      <header className="premium-header">
        <button className="premium-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <span className="premium-header-title">Premium PRO</span>
      </header>

      {isAnonymous ? (
        <div className="premium-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div className="premium-sales-area" style={{ padding: '32px 20px', maxWidth: '320px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff' }}>Área VIP</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Apenas usuários com conta podem assinar o Premium PRO. Crie uma conta gratuita.
            </p>
            <button className="sales-buy-btn" onClick={handleRegisterClick}>
              Criar Conta Grátis
            </button>
          </div>
        </div>
      ) : (
        <div className="premium-content">
        
        {isPremium ? (
          // ==============================
          // TELA VIP (USUÁRIO PREMIUM)
          // ==============================
          <div className="premium-vip-area">
            <div className="vip-welcome">
              <div className="vip-crown-icon">
                <Crown size={48} color="#fcd34d" />
              </div>
              <h1>Olá, VIP!</h1>
              <p>Você faz parte do grupo exclusivo do PapoLivre.</p>
            </div>

            <div className="vip-status-card">
              <div className="vip-status-header">
                <h3>Sua Assinatura</h3>
                <span className="vip-badge">Ativa</span>
              </div>
              <p>Seu Premium PRO é válido até <strong>{proUntil?.toLocaleDateString("pt-BR")}</strong>.</p>
            </div>

            <div className="vip-benefits-section">
              <h2>Benefícios Ativos</h2>
              <div className="vip-benefit-item">
                <CheckCircle size={20} className="vip-check" />
                <div>
                  <h4>Personalização Avançada</h4>
                  <p>Mude seu avatar utilizando nossa integração especial.</p>
                </div>
              </div>
              <div className="vip-benefit-item">
                <CheckCircle size={20} className="vip-check" />
                <div>
                  <h4>Selo VIP</h4>
                  <p>Coroa exclusiva ao lado do seu nome.</p>
                </div>
              </div>
              <div className="vip-benefit-item">
                <CheckCircle size={20} className="vip-check" />
                <div>
                  <h4>Criar Salas</h4>
                  <p>Você pode ser dono das suas próprias salas de chat.</p>
                </div>
              </div>
              <div className="vip-benefit-item">
                <CheckCircle size={20} className="vip-check" />
                <div>
                  <h4>Salas Simultâneas</h4>
                  <p>Participe de até 5 salas ao mesmo tempo.</p>
                </div>
              </div>
              <div className="vip-benefit-item">
                <CheckCircle size={20} className="vip-check" />
                <div>
                  <h4>Salas Cheias</h4>
                  <p>Fure a fila e entre em salas com mais de 100 pessoas.</p>
                </div>
              </div>
            </div>

            <div className="vip-future-section">
              <h2>Em Breve para VIPs</h2>
              <div className="vip-future-item">
                <MessageCircle size={18} className="vip-future-icon" />
                <span>Efeitos Especiais no Chat</span>
              </div>
            </div>
          </div>
        ) : (
          // ==============================
          // TELA VENDA (USUÁRIO FREE)
          // ==============================
          <div className="premium-sales-area">
            <div className="sales-hero">
              <Crown size={56} className="sales-crown" />
              <h1>Seja Premium PRO</h1>
              <p>Eleve sua experiência no PapoLivre com vantagens exclusivas.</p>
            </div>

            <div className="sales-benefits-list">
              <div className="sales-benefit">
                <div className="sales-icon"><Crown size={20}/></div>
                <div className="sales-text">
                  <h3>Selo de Destaque</h3>
                  <p>Mostre a todos que você é VIP com uma coroa no seu perfil e mensagens.</p>
                </div>
              </div>
              <div className="sales-benefit">
                <div className="sales-icon"><Users size={20}/></div>
                <div className="sales-text">
                  <h3>Salas Sem Limites</h3>
                  <p>Entre em salas lotadas e participe de até 5 salas simultâneas.</p>
                </div>
              </div>
              <div className="sales-benefit">
                <div className="sales-icon"><Sparkles size={20}/></div>
                <div className="sales-text">
                  <h3>Criador de Salas</h3>
                  <p>Crie e administre suas próprias comunidades.</p>
                </div>
              </div>
              <div className="sales-benefit">
                <div className="sales-icon"><Users size={20}/></div>
                <div className="sales-text">
                  <h3>Personalização Avançada</h3>
                  <p>Libere o criador de avatares super customizáveis.</p>
                </div>
              </div>
            </div>

            <div className="sales-cta-box">
              <div className="sales-price">
                <span className="price-value">{settings.premiumPrice}</span>
                <span className="price-label">créditos / semana</span>
              </div>
              <button 
                className="sales-buy-btn" 
                onClick={handleActivatePro}
                disabled={activating}
              >
                {activating ? "Ativando..." : "Ativar Premium Pro"}
              </button>
              {credits < settings.premiumPrice && (
                <p className="sales-hint">Você possui {credits} créditos. <a onClick={() => navigate(ROUTES.BENEFITS)}>Adquirir mais</a></p>
              )}
            </div>
          </div>
        )}

      </div>
      )}
    </main>
  );
}

export default Premium;
