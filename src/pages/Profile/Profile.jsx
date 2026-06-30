import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";

// Lucide icons
import {
  ArrowLeft,
  User,
  MapPin,
  Pencil,
  CheckCircle,
  Lock,
  Crown,
  Coins,
  MessageCircleHeart,
  Sparkles,
  ShieldCheck,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import UserAvatar from "../../components/ui/UserAvatar/UserAvatar";
import DiceBearPicker from "../../components/profile/DiceBearPicker/DiceBearPicker";

// ── Plan perks config ───────────────────────────────────────────
const FREE_PERKS = [
  { icon: "💬", color: "green", text: <><strong>3 salas</strong> simultâneas</> },
  { icon: "👥", color: "green", text: <>Salas com até <strong>100 pessoas</strong></> },
];

const PREMIUM_PERKS = [
  { icon: "✨", color: "gold", text: <><strong>Criar</strong> novas salas</> },
  { icon: "👥", color: "gold", text: <>Salas com mais de <strong>100 pessoas</strong></> },
  { icon: "🔑", color: "gold", text: <>Entrar em até <strong>5 salas</strong> simultâneas</> },
  { icon: "👑", color: "gold", text: <>Selo exclusivo de <strong>Premium PRO</strong></> },
  { icon: "🎨", color: "purple", text: <><strong>Personalizar avatares</strong> <span style={{opacity:0.5, fontSize: "11px"}}>(em breve)</span></> },
];

// ═══════════════════════════════════════════════════════════════
function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAnonymous = !!(user?.anonymous || user?.isAnonymous);
  const isPremium   = !!user?.isPremium;
  const credits     = user?.credits || 0;

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

  // ── Handlers ────────────────────────────────────────────────
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
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivatePro() {
    if (!user?.uid || credits <= 0) return;
    try {
      const base = isPremium && user.proUntil ? user.proUntil.toMillis() : Date.now();
      await updateDoc(doc(db, "users", user.uid), {
        credits: credits - 1,
        proUntil: Timestamp.fromMillis(base + 7 * 24 * 60 * 60 * 1000),
      });
      alert("Premium PRO ativado por 7 dias! 🎉");
    } catch (err) {
      console.error(err);
      alert("Erro ao ativar. Tente novamente.");
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <main className="profile-page">

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="prof-header">
        <button
          id="profile-back-btn"
          className="prof-header__back"
          onClick={() => navigate(ROUTES.HOME)}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="prof-header__title">Meu Perfil</span>
        <div className="prof-header__spacer" />
      </header>

      <div className="prof-container">

        {/* ── HERO: Avatar + Nome ─────────────────────────── */}
        <div className="prof-card">
          <div className="prof-hero">
            <div className="prof-hero__bg-glow" />

            {/* Avatar */}
            <div className="prof-avatar-wrap">
              <div
                className="prof-avatar-clickable"
                onClick={() => { if (!isAnonymous) setAvatarOpen(true); }}
                role="button"
                aria-label="Trocar avatar"
                id="profile-avatar-toggle"
                style={{ cursor: isAnonymous ? 'default' : 'pointer', position: 'relative' }}
              >
                <UserAvatar avatarData={avatar} fallbackUid={user?.uid} size={90} className="prof-avatar-override" />
              </div>
              {!isAnonymous && (
                <button
                  className="prof-avatar-edit-btn"
                  onClick={() => setAvatarOpen(true)}
                  aria-label="Editar avatar"
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>

            {/* Badge de plano */}
            {isPremium ? (
              <span className="prof-badge prof-badge--premium">
                <Crown size={11} /> Premium PRO
              </span>
            ) : isAnonymous ? (
              <span className="prof-badge prof-badge--anon">
                👻 Anônimo
              </span>
            ) : (
              <span className="prof-badge prof-badge--free">
                Free
              </span>
            )}

            <h1 className="prof-hero__name">{nickname || name || "Usuário"}</h1>
            {!isAnonymous && city && (
              <p className="prof-hero__sub">📍 {city}</p>
            )}
          </div>
        </div>

        {/* ── CARTEIRA & PLANO (só para logados) ─────────── */}
        {!isAnonymous && (
          <div className="prof-card prof-plan-card">
            <div className="prof-plan-card__header">
              <span className="prof-plan-card__title">
                <ShieldCheck size={13} style={{display:"inline",marginRight:5}} />
                Seu Plano
              </span>
              <div className="prof-plan-card__wallet" title="Créditos disponíveis">
                <Coins size={14} />
                {credits} crédito{credits !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Status premium / free */}
            {isPremium ? (
              <div className="prof-plan-status prof-plan-status--premium">
                <div className="prof-plan-status__top">
                  <Crown size={18} color="#f59e0b" />
                  <span>Premium PRO ativo</span>
                </div>
                <p className="prof-plan-status__sub">Válido até {proExpirationDate}</p>
              </div>
            ) : (
              <div className="prof-plan-status prof-plan-status--free">
                <div className="prof-plan-status__top">
                  <Star size={16} color="#94a3b8" />
                  <span>Plano Gratuito</span>
                </div>
                <p className="prof-plan-status__sub">Sem restrições de mensagens</p>
              </div>
            )}

            {/* O que você tem (Free) */}
            <p style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>
              {isPremium ? "Você tem acesso a" : "Plano Free inclui"}
            </p>
            <div className="prof-perks">
              {FREE_PERKS.map((p, i) => (
                <div className="prof-perk" key={i}>
                  <div className={`prof-perk__icon prof-perk__icon--green`}>{p.icon}</div>
                  <span className="prof-perk__text">{p.text}</span>
                </div>
              ))}
            </div>

            <div className="prof-divider" />

            {/* Premium perks */}
            <p style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>
              {isPremium ? "Vantagens Premium" : "Com Premium PRO"}
            </p>
            <div className="prof-perks">
              {PREMIUM_PERKS.map((p, i) => (
                <div className={`prof-perk ${!isPremium ? "prof-perk--locked" : ""}`} key={i}>
                  <div className={`prof-perk__icon prof-perk__icon--${p.color}`}>{p.icon}</div>
                  <span className="prof-perk__text">{p.text}</span>
                </div>
              ))}
            </div>

            <div className="prof-divider" />

            {/* CTA */}
            {credits > 0 && !isPremium ? (
              <button id="profile-activate-pro-btn" className="prof-btn-activate" onClick={handleActivatePro}>
                <Crown size={16} />
                Ativar Premium PRO (1 crédito)
              </button>
            ) : !isPremium ? (
              <a
                id="profile-telegram-link"
                href="https://t.me/Opapolivre"
                target="_blank"
                rel="noopener noreferrer"
                className="prof-btn-telegram"
              >
                <MessageCircleHeart size={16} />
                Adquirir créditos — @Opapolivre
              </a>
            ) : null}
          </div>
        )}

        {/* ── ANON: banner de incentivo ao login ─────────── */}
        {isAnonymous && (
          <div className="prof-card" style={{padding:"20px"}}>
            <div className="prof-anon-lock-banner">
              <div className="prof-anon-lock-banner__icon">🔐</div>
              <div className="prof-anon-lock-banner__text">
                <h4>Você está como anônimo</h4>
                <p>
                  Crie uma conta grátis para salvar seu perfil, desbloquear avatares,
                  acessar créditos e muito mais.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── FORMULÁRIO DE EDIÇÃO ────────────────────────── */}
        <div className="prof-card prof-form-card">
          <p className="prof-form-card__title">
            <Pencil size={13} style={{display:"inline",marginRight:5}} />
            {isAnonymous ? "Editar apelido" : "Editar informações"}
          </p>

          <form id="profile-edit-form" onSubmit={handleSave}>

            {/* Apelido — todos podem editar */}
            <div className="prof-field">
              <label className="prof-field__label">
                <User size={13} /> Apelido
              </label>
              <div className="prof-input-wrap">
                <span className="prof-input-icon"><User size={16} /></span>
                <input
                  id="profile-nickname-input"
                  className="prof-input"
                  type="text"
                  placeholder="Seu apelido..."
                  value={nickname}
                  maxLength={20}
                  onChange={e => setNickname(e.target.value)}
                />
              </div>
            </div>

            {/* Nome completo — só logados */}
            {!isAnonymous && (
              <div className="prof-field">
                <label className="prof-field__label">
                  <User size={13} /> Nome
                </label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><User size={16} /></span>
                  <input
                    id="profile-name-input"
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

            {/* Cidade — só logados */}
            <div className="prof-field">
              <label className="prof-field__label">
                <MapPin size={13} /> Cidade
                {isAnonymous && (
                  <span className="prof-field__lock-badge">
                    <Lock size={9} /> conta registrada
                  </span>
                )}
              </label>
              <div className="prof-input-wrap">
                <span className="prof-input-icon"><MapPin size={16} /></span>
                <input
                  id="profile-city-input"
                  className="prof-input"
                  type="text"
                  placeholder={isAnonymous ? "Crie uma conta para editar" : "Sua cidade..."}
                  value={isAnonymous ? "" : city}
                  disabled={isAnonymous}
                  onChange={isAnonymous ? undefined : e => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Idade — só logados */}
            {!isAnonymous && (
              <div className="prof-field">
                <label className="prof-field__label">
                  <Sparkles size={13} /> Idade
                </label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><Sparkles size={16} /></span>
                  <input
                    id="profile-age-input"
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
              id="profile-save-btn"
              type="submit"
              className={`prof-save-btn ${saved ? "prof-save-btn--saved" : ""}`}
              disabled={saving}
            >
              {saving ? (
                "Salvando..."
              ) : saved ? (
                <><CheckCircle size={16} /> Salvo!</>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </form>
        </div>

        {/* ── SUPORTE / PREMIUM CTA ───────────────────────── */}
        <button
          id="profile-premium-cta"
          className="prof-card"
          style={{
            display:"flex", alignItems:"center", gap:"16px",
            padding:"20px", cursor:"pointer", border:"1px solid rgba(167,139,250,0.2)",
            background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05))",
            width:"100%", textAlign:"left",
          }}
          onClick={() => navigate(ROUTES.PREMIUM)}
        >
          <div style={{
            width:"52px", height:"52px", borderRadius:"14px", flexShrink:0,
            background:"rgba(139,92,246,0.15)", display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>
            <Sparkles size={24} color="#a78bfa" />
          </div>
          <div style={{flex:1}}>
            <p style={{fontWeight:700, margin:"0 0 4px", fontSize:"15px"}}>Apoie o PapoLivre</p>
            <p style={{color:"var(--text-muted)", fontSize:"13px", margin:0, lineHeight:1.5}}>
              Sua contribuição mantém o projeto online e vivo.
            </p>
          </div>
          <ArrowLeft size={18} color="#a78bfa" style={{transform:"rotate(180deg)", flexShrink:0}} />
        </button>

      </div>

      {/* ── AVATAR PICKER (Outside of .prof-card to avoid stacking context / overflow issues) ── */}
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