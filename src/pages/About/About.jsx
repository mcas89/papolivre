import "./About.css";
import { ArrowLeft, Heart, MessageCircle, Users, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import logo from "../../assets/logo/logo01.png";

const features = [
  { icon: <MessageCircle size={20} />, label: "Salas temáticas de bate-papo" },
  { icon: <Users size={20} />,         label: "Pessoas Próximas por geolocalização" },
  { icon: <Zap size={20} />,           label: "Acesso instantâneo — sem cadastro" },
  { icon: <Shield size={20} />,        label: "Mensagens privadas e bloqueio de usuários" },
];

function About() {
  const navigate = useNavigate();

  return (
    <main className="about-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft size={20} />
        </button>
        <div className="legal-header-icon about-icon">
          <Heart size={20} />
        </div>
        <div>
          <h1>Sobre o PapoLivre</h1>
          <span>Versão 2.0</span>
        </div>
      </header>

      <div className="about-content">

        {/* Logo + nome */}
        <div className="about-hero">
          <img src={logo} alt="PapoLivre" className="about-logo" />
          <div className="about-version-badge">v 2.0</div>
          <h2>PapoLivre</h2>
          <p className="about-tagline">Bate-papo livre, leve e sem julgamentos.</p>
        </div>

        {/* Missão */}
        <div className="about-mission">
          <p>
            O <strong>PapoLivre</strong> nasceu da ideia de que todo mundo merece um espaço para conversar de forma leve, sem expor dados pessoais e sem depender de grandes redes sociais.
          </p>
          <p>
            É um projeto independente, construído com carinho e mantido gratuito por quem acredita que conexão humana genuína não precisa custar nada.
          </p>
        </div>

        {/* Funcionalidades */}
        <div className="about-features-section">
          <h3>O que você encontra aqui</h3>
          <ul className="about-features-list">
            {features.map((f, i) => (
              <li key={i} className="about-feature-item">
                <span className="about-feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Versão */}
        <div className="about-release">
          <div className="about-release-info">
            <span className="about-release-label">Versão atual</span>
            <span className="about-release-version">2.0.0</span>
          </div>
          <div className="about-release-info">
            <span className="about-release-label">Lançamento</span>
            <span className="about-release-version">Junho 2025</span>
          </div>
          <div className="about-release-info">
            <span className="about-release-label">Plataforma</span>
            <span className="about-release-version">Web (PWA)</span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="about-footer">
          <p>Feito com <Heart size={13} className="about-heart" /> e muito café ☕</p>
          <button
            className="about-privacy-link"
            onClick={() => navigate(ROUTES.PRIVACY)}
          >
            Ler a Política de Privacidade
          </button>
        </div>

      </div>
    </main>
  );
}

export default About;
