import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Splash.css";

import logo from "../../assets/logo/logo.png";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

const TOTAL    = 2500; // duração total em ms
const EXIT_MS  = 400;  // tempo da animação de saída

function Splash() {

  const navigate         = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {

    // Aguarda o AuthContext resolver antes de cronometrar
    if (loading) return;

    const exitTimer = setTimeout(() => setExiting(true), TOTAL - EXIT_MS);

    const navTimer = setTimeout(() => {
      navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN, { replace: true });
    }, TOTAL);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };

  }, [loading, isAuthenticated, navigate]);

  return (

    <main className={`splash ${exiting ? "splash--exit" : ""}`}>

      {/* Glow de fundo */}
      <div className="splash-bg-glow" />

      <div className="splash-content">

        {/* Anel de brilho atrás do logo */}
        <div className="splash-logo-halo">
          <img src={logo} alt="PapoLivre" className="splash-logo" />
        </div>

        <p className="splash-tagline">
          Converse com quem está perto de você
        </p>

        <div className="splash-dots">
          <span />
          <span />
          <span />
        </div>

      </div>

    </main>

  );

}

export default Splash;