import "./Login.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";

import logo from "../../assets/logo/logo.png";

import Card   from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input  from "../../components/ui/Input/Input";

import { ROUTES }  from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { requestApproximateLocation } from "../../utils/location";

function Login() {

  const { login, loginAnonymous } = useAuth();
  const navigate  = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loadingAnon, setLoadingAnon] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error,       setError]       = useState("");

  // Estados do Modal Anônimo
  const [showAnonModal, setShowAnonModal] = useState(false);
  const [anonNickname,  setAnonNickname]  = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("👦🏻");
  const [tempLocation,  setTempLocation]  = useState(null);
  const [anonError,     setAnonOptionError] = useState("");

  const anonymousAvatars = [
    { emoji: "👦🏻", label: "Homem Branco" },
    { emoji: "👦🏿", label: "Homem Negro" },
    { emoji: "👧🏻", label: "Mulher Branca" },
    { emoji: "👧🏿", label: "Mulher Negra" }
  ];

  // =====================================================
  // ETAPA 1: SOLICITAR LOCALIZAÇÃO ANTES DO MODAL
  // =====================================================
  async function handleAnonymousLogin() {
    setLoadingAnon(true);
    setError("");
    let location = null;
    try {
      location = await requestApproximateLocation();
    } catch (err) {
      console.warn("Localização não obtida no login anônimo:", err);
    }
    setTempLocation(location);
    setShowAnonModal(true);
    setLoadingAnon(false);
  }

  // =====================================================
  // ETAPA 2: REALIZAR O LOGIN DE FATO COM DADOS DO MODAL
  // =====================================================
  async function handleConfirmAnonLogin(e) {
    e.preventDefault();
    if (!anonNickname.trim()) {
      setAnonOptionError("Por favor, digite um apelido.");
      return;
    }
    if (anonNickname.trim().length < 3) {
      setAnonOptionError("O apelido deve ter pelo menos 3 caracteres.");
      return;
    }

    setLoadingAnon(true);
    setAnonOptionError("");
    try {
      await loginAnonymous({
        nickname: anonNickname.trim(),
        avatar: selectedAvatar,
        location: tempLocation
      });
      setShowAnonModal(false);
      navigate(ROUTES.HOME);
    } catch (err) {
      setAnonOptionError(err?.message || "Erro ao entrar como anônimo.");
    } finally {
      setLoadingAnon(false);
    }
  }

  // =====================================================
  // LOGIN COM EMAIL E SENHA
  // =====================================================
  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setLoadingForm(true);
    setError("");
    
    let location = null;
    try {
      location = await requestApproximateLocation();
    } catch (err) {
      console.warn("Localização não obtida no login:", err);
    }

    try {
      await login({ email, password, location });
      navigate(ROUTES.HOME);
    } catch (err) {
      // Traduz erros comuns do Firebase
      const msg = err?.code === "auth/invalid-credential"
        ? "Email ou senha incorretos."
        : err?.code === "auth/too-many-requests"
        ? "Muitas tentativas. Tente mais tarde."
        : err?.message || "Erro ao entrar. Tente novamente.";
      setError(msg);
    } finally {
      setLoadingForm(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (

    <main className="login">

      <Card className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <img src={logo} className="login-logo" alt="PapoLivre" />
          <h1 className="login-title">Bem-vindo</h1>
          <p className="login-subtitle">Entre e comece a conversar</p>
        </div>

        {/* ERRO GLOBAL */}
        {error && (
          <div className="login-error">
            <span>{error}</span>
          </div>
        )}

        {/* BOTÃO ENTRAR SEM CADASTRO */}
        <button
          className="btn-anon"
          onClick={handleAnonymousLogin}
          disabled={loadingAnon}
          type="button"
        >
          <span className="btn-anon-glow" />
          <Zap size={20} className={loadingAnon ? "spin" : "zap-icon"} />
          <span className="btn-anon-text">
            {loadingAnon ? "Aguardando localização..." : "Entrar sem cadastro"}
          </span>

        </button>

        {/* DIVISOR */}
        <div className="divider">ou entre com sua conta</div>

        {/* FORM */}
        <form className="login-form" onSubmit={handleLogin} noValidate>

          <div className="input-group">
            <Mail size={16} />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </div>

          <div className="input-group">
            <Lock size={16} />
            <Input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            full
            disabled={loadingForm}
          >
            {loadingForm ? "Entrando..." : "Entrar"}
          </Button>

        </form>

        {/* FOOTER */}
        <div className="login-footer">
          <span>Ainda não tem conta?</span>{" "}
          <Link to={ROUTES.QUICK_REGISTER} className="register-link">
            Criar conta
          </Link>
        </div>

      </Card>

      {/* MODAL CONFIGURAÇÃO ANÔNIMO */}
      {showAnonModal && (
        <>
          <div className="anon-modal-overlay" onClick={() => setShowAnonModal(false)} />
          <div className="anon-modal">
            <div className="anon-modal-header">
              <h2>Configurar Perfil Anônimo</h2>
              <p>Escolha como deseja aparecer no chat</p>
            </div>

            {anonError && (
              <div className="anon-modal-error">
                <span>{anonError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmAnonLogin} className="anon-modal-form">
              <div className="anon-input-wrapper">
                <label>Seu Apelido</label>
                <Input
                  type="text"
                  placeholder="Apelido no chat"
                  value={anonNickname}
                  onChange={(e) => { setAnonNickname(e.target.value); setAnonOptionError(""); }}
                  maxLength={10}
                  required
                />
              </div>

              <div className="anon-avatars-section">
                <label>Escolha seu Avatar</label>
                <div className="anon-avatars-grid">
                  {anonymousAvatars.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      className={`anon-avatar-btn ${selectedAvatar === av.emoji ? "active" : ""}`}
                      onClick={() => setSelectedAvatar(av.emoji)}
                      title={av.label}
                    >
                      <span className="anon-avatar-emoji">{av.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="anon-modal-actions">
                <Button
                  type="submit"
                  variant="primary"
                  full
                  disabled={loadingAnon}
                >
                  {loadingAnon ? "Entrando..." : "Confirmar e Entrar"}
                </Button>
                <button
                  type="button"
                  className="btn-cancel-anon"
                  onClick={() => setShowAnonModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </main>

  );

}

export default Login;