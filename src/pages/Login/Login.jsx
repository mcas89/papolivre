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

  const { login, loginAnonymous, resetPassword } = useAuth();
  const navigate  = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loadingAnon, setLoadingAnon] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error,       setError]       = useState("");

  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Estados do Modal Anônimo
  const [showAnonModal, setShowAnonModal] = useState(false);
  const [anonNickname,  setAnonNickname]  = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("homem");
  const [tempLocation,  setTempLocation]  = useState(null);
  const [anonError,     setAnonOptionError] = useState("");

  const anonymousOptions = [
    { id: "homem", emoji: "👨", label: "Homem" },
    { id: "mulher", emoji: "👩", label: "Mulher" },
    { id: "aleatorio", emoji: "🎲", label: "Aleatório" }
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
      // Gerar seed baseado na escolha
      let seedStr = `Anon_${Math.floor(Math.random() * 10000)}`;
      if (selectedAvatar === "homem") seedStr = `Male_${Math.floor(Math.random() * 10000)}`;
      else if (selectedAvatar === "mulher") seedStr = `Female_${Math.floor(Math.random() * 10000)}`;

      const newAvatarData = {
        seed: seedStr,
        premium: false,
        options: {}
      };

      await loginAnonymous({
        nickname: anonNickname.trim(),
        avatar: newAvatarData,
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
  // RECUPERAÇÃO DE SENHA
  // =====================================================
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!email) {
      setError("Por favor, preencha seu e-mail para recuperar a senha.");
      return;
    }
    setLoadingForm(true);
    setError("");
    setResetSuccess(false);
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err) {
      const msg = err?.code === "auth/user-not-found"
        ? "Nenhuma conta encontrada com este e-mail."
        : err?.code === "auth/invalid-email"
        ? "E-mail inválido."
        : "Erro ao enviar e-mail. Tente novamente.";
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

        {/* ERRO / SUCESSO GLOBAL */}
        {error && (
          <div className="login-error">
            <span>{error}</span>
          </div>
        )}
        {resetSuccess && (
          <div className="login-success" style={{ color: "#2ecc71", background: "rgba(46, 204, 113, 0.1)", padding: "12px", borderRadius: "8px", textAlign: "center", marginBottom: "16px", fontSize: "0.9rem" }}>
            E-mail de recuperação enviado! Verifique sua caixa de entrada.
          </div>
        )}

        {!isResetting ? (
          <>
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

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button
              type="button"
              className="reset-pass-btn"
              onClick={() => { setIsResetting(true); setError(""); setResetSuccess(false); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Esqueci minha senha
            </button>
          </div>

        </form>
        </>
        ) : (
          <form className="login-form" onSubmit={handleResetPassword} noValidate>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", textAlign: "center", marginBottom: "16px" }}>
              Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
            </p>
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
            
            <Button type="submit" variant="primary" full disabled={loadingForm}>
              {loadingForm ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
            
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => { setIsResetting(false); setError(""); setResetSuccess(false); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Voltar para o login
              </button>
            </div>
          </form>
        )}

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
                <div className="anon-avatars-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {anonymousOptions.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`anon-avatar-btn ${selectedAvatar === av.id ? "active" : ""}`}
                      onClick={() => setSelectedAvatar(av.id)}
                      title={av.label}
                    >
                      <span className="anon-avatar-emoji">{av.emoji}</span>
                      <span style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>{av.label}</span>
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