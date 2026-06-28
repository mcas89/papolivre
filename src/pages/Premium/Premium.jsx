import "./Premium.css";
import { useState } from "react";
import { ArrowLeft, Heart, Copy, Check, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const PIX_KEY = "marcos.mcas89@gmail.com";

function Premium() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  function handleCopyPix() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <main className="support-page">
      {/* Partículas de fundo */}
      <div className="support-bg">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`bubble bubble-${i + 1}`} />
        ))}
      </div>

      <header className="support-header">
        <button className="support-back-btn" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="support-content">

        {/* Ícone animado */}
        <div className="support-icon-ring">
          <div className="support-icon-inner">
            <Heart size={48} className="support-heart" />
          </div>
        </div>

        {/* Título */}
        <h1 className="support-title">Apoie o PapoLivre</h1>
        <p className="support-subtitle">
          O PapoLivre é <strong>gratuito</strong> e não tem anúncios.<br />
          Se ele te ajudou a conhecer alguém ou apenas matar o tempo,<br />
          considere jogar qualquer valor no Pix para manter o projeto vivo 💙
        </p>

        {/* Card PIX */}
        <div className="pix-card">
          <div className="pix-card-label">
            <span className="pix-badge">PIX</span>
            <span>Qualquer valor já ajuda muito!</span>
          </div>

          <div className="pix-key-box">
            <span className="pix-key-text">{PIX_KEY}</span>
            <button
              className={`pix-copy-btn ${copied ? "pix-copy-btn--copied" : ""}`}
              onClick={handleCopyPix}
              title="Copiar chave PIX"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>

          {copied && (
            <p className="pix-copied-hint">✅ Chave copiada! Cole no seu app do banco para transferir.</p>
          )}
        </div>

        {/* Agradecimento */}
        <p className="support-thanks">
          Obrigado de coração 🙏<br />
          <small>Não é obrigatório — só se você quiser e puder!</small>
        </p>

        {/* Separador */}
        <div className="support-divider">
          <span>Quer mais vantagens?</span>
        </div>

        {/* Botão PRO */}
        <button
          className="support-pro-btn"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          <Crown size={18} />
          Ver meu Perfil & Créditos PRO
        </button>

        <button
          className="support-home-btn"
          onClick={() => navigate(ROUTES.HOME)}
        >
          Voltar para o início
        </button>

      </div>
    </main>
  );
}

export default Premium;