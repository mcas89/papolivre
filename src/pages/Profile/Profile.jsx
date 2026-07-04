import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useToast } from "../../context/ToastContext";

// Lucide icons
import {
  ArrowLeft, User, MapPin, Pencil, CheckCircle, Lock, Crown, Coins, Sparkles, Star, PackageOpen, LayoutDashboard
} from "lucide-react";

import UserAvatar from "../../components/ui/UserAvatar/UserAvatar";
import DiceBearPicker from "../../components/profile/DiceBearPicker/DiceBearPicker";

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const credits = user?.credits || 0;

  const isAnonymous = !!(user?.anonymous || user?.isAnonymous);
  const isPremium   = !!user?.isPremium;

  // Form state
  const [avatar,    setAvatar]    = useState(user?.avatar   || null);
  const [nickname,  setNickname]  = useState(user?.nickname || user?.name || "");
  const [name,      setName]      = useState(user?.name     || "");
  const [city,      setCity]      = useState(user?.city     || "");
  const [age,       setAge]       = useState(user?.age      || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // UI state
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Pro expiry
  let proExpirationDate = "";
  if (isPremium && user?.proUntil) {
    const d = new Date(user.proUntil.toMillis());
    proExpirationDate = d.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = { avatar, nickname };
      if (!isAnonymous) {
        Object.assign(payload, { name, city, age: age ? Number(age) : null });
      }
      await setDoc(doc(db, "users", user.uid), payload, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      showToast("Erro ao salvar. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page">

      <header className="prof-header">
        <button
          className="prof-header__back"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <ArrowLeft size={20} />
        </button>
        <span className="prof-header__title">Meu Perfil</span>
        <div className="prof-header__spacer" />
      </header>

      <div className="prof-container">

        {/* HERO: Avatar + Nome + Tipo de Conta */}
        <div className="prof-card prof-hero">
          <div className="prof-hero__bg-glow" />
          <div className="prof-avatar-wrap">
            <div
              className="prof-avatar-clickable"
              onClick={() => { if (!isAnonymous) setAvatarOpen(true); }}
              style={{ cursor: isAnonymous ? 'default' : 'pointer', position: 'relative' }}
            >
              <UserAvatar avatarData={avatar} fallbackUid={user?.uid} size={90} className="prof-avatar-override" />
            </div>
            {!isAnonymous && (
              <button
                className="prof-avatar-edit-btn"
                onClick={() => setAvatarOpen(true)}
              >
                <Pencil size={12} />
              </button>
            )}
          </div>

          <h1 className="prof-hero__name">{nickname || name || "Usuário"}</h1>
          {!isAnonymous && city && (
            <p className="prof-hero__sub">📍 {city}</p>
          )}

          <div className="prof-account-type">
            {isPremium ? (
              <span className="prof-badge prof-badge--premium"><Crown size={11} /> Premium PRO</span>
            ) : isAnonymous ? (
              <span className="prof-badge prof-badge--anon">👻 Anônimo</span>
            ) : (
              <span className="prof-badge prof-badge--free"><Star size={11} /> Free</span>
            )}
          </div>
        </div>

        {/* BLOCO 1: CRÉDITOS E BENEFÍCIOS */}
        {!isAnonymous && (
          <div className="prof-card prof-section-card">
            <div className="prof-section-header">
              <div className="prof-section-title">
                <Coins size={18} color="#fcd34d" />
                <span>Carteira</span>
              </div>
              <div className="prof-credits-display">
                <span className="credits-amount">{credits}</span>
                <span className="credits-label">Créditos</span>
              </div>
            </div>
            
            <button
              className="prof-btn-primary"
              onClick={() => navigate(ROUTES.BENEFITS)}
            >
              <PackageOpen size={16} />
              ✨ Benefícios
            </button>
          </div>
        )}

        {/* BLOCO 2: PREMIUM PRO */}
        {!isAnonymous && (
          <div className="prof-card prof-section-card">
            <div className="prof-section-header">
              <div className="prof-section-title">
                <Crown size={18} color={isPremium ? "#f59e0b" : "#a78bfa"} />
                <span>Assinatura</span>
              </div>
            </div>
            
            <div className={`prof-sub-status ${isPremium ? "active" : "inactive"}`}>
              {isPremium ? (
                <>
                  <p><strong>Premium PRO Ativo</strong></p>
                  <p className="sub-validity">Válido até {proExpirationDate}</p>
                </>
              ) : (
                <p>Plano Gratuito</p>
              )}
            </div>

            <button
              className="prof-btn-secondary"
              onClick={() => navigate(ROUTES.PREMIUM)}
            >
              <Crown size={16} />
              Gerenciar Premium Pro
            </button>
          </div>
        )}

        {/* BLOCO 3: ESTATÍSTICAS (EM BREVE) */}
        {!isAnonymous && (
          <div className="prof-card prof-section-card disabled-section">
            <div className="prof-section-header">
              <div className="prof-section-title">
                <LayoutDashboard size={18} />
                <span>Estatísticas</span>
              </div>
              <span className="future-badge">Em breve</span>
            </div>
            <p className="future-desc">Veja quantas mensagens você enviou, tempo em salas e muito mais.</p>
          </div>
        )}

        {/* BANNER ANÔNIMO */}
        {isAnonymous && (
          <div className="prof-card" style={{padding:"20px"}}>
            <div className="prof-anon-lock-banner">
              <div className="prof-anon-lock-banner__icon">🔐</div>
              <div className="prof-anon-lock-banner__text">
                <h4>Você está como anônimo</h4>
                <p>Crie uma conta grátis para salvar seu perfil, acessar créditos e vantagens.</p>
              </div>
            </div>
          </div>
        )}

        {/* BLOCO 4: CONFIGURAÇÕES */}
        <div className="prof-card prof-form-card">
          <p className="prof-form-card__title">
            <Pencil size={13} style={{display:"inline",marginRight:5}} />
            {isAnonymous ? "Editar apelido" : "Configurações do Perfil"}
          </p>

          <form id="profile-edit-form" onSubmit={handleSave}>
            <div className="prof-field">
              <label className="prof-field__label">
                <User size={13} /> Apelido
              </label>
              <div className="prof-input-wrap">
                <span className="prof-input-icon"><User size={16} /></span>
                <input
                  className="prof-input"
                  type="text"
                  placeholder="Seu apelido..."
                  value={nickname}
                  maxLength={20}
                  onChange={e => setNickname(e.target.value)}
                />
              </div>
            </div>

            {!isAnonymous && (
              <div className="prof-field">
                <label className="prof-field__label">
                  <User size={13} /> Nome Completo
                </label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><User size={16} /></span>
                  <input
                    className="prof-input"
                    type="text"
                    placeholder="Seu nome..."
                    value={name}
                    maxLength={40}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="prof-field">
              <label className="prof-field__label">
                <MapPin size={13} /> Cidade
                {isAnonymous && <span className="prof-field__lock-badge"><Lock size={9} /> conta registrada</span>}
              </label>
              <div className="prof-input-wrap">
                <span className="prof-input-icon"><MapPin size={16} /></span>
                <input
                  className="prof-input"
                  type="text"
                  placeholder={isAnonymous ? "Crie uma conta para editar" : "Sua cidade..."}
                  value={isAnonymous ? "" : city}
                  disabled={isAnonymous}
                  onChange={isAnonymous ? undefined : e => setCity(e.target.value)}
                />
              </div>
            </div>

            {!isAnonymous && (
              <div className="prof-field">
                <label className="prof-field__label">
                  <Sparkles size={13} /> Idade
                </label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><Sparkles size={16} /></span>
                  <input
                    className="prof-input"
                    type="number"
                    placeholder="Sua idade..."
                    value={age}
                    min={13}
                    max={99}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`prof-save-btn ${saved ? "prof-save-btn--saved" : ""}`}
              disabled={saving}
            >
              {saving ? "Salvando..." : saved ? <><CheckCircle size={16} /> Salvo!</> : "Salvar Alterações"}
            </button>
          </form>
        </div>

      </div>

      {avatarOpen && !isAnonymous && (
        <DiceBearPicker
          isPremium={isPremium}
          initialAvatar={avatar}
          onClose={() => setAvatarOpen(false)}
          onSave={(newAvatar) => {
            setAvatar(newAvatar);
            setAvatarOpen(false);
          }}
        />
      )}

    </main>
  );
}

export default Profile;