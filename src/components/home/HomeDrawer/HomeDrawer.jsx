import "./HomeDrawer.css";

import {
  X,
  House,
  Search,
  User,
  Crown,
  LogOut,
  Info,
  ShieldCheck,
  PackageOpen
} from "lucide-react";

import logo from "../../../assets/logo/logo01.png";

function HomeDrawer({
  open,
  onClose,
  user,
  onHome,
  onSearch,
  onProfile,
  onBenefits,
  onPremium,
  onLogout,
  onAbout,
  onPrivacy,
}) {

  if (!open) return null;

  const userName =
    user?.nickname ||
    user?.displayName ||
    "Visitante";

  const city =
    user?.city ||
    "Sua cidade";

  return (
    <>
      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      <aside className="home-drawer">

        <div className="drawer-header">

          <div className="drawer-user">

            <img
              src={logo}
              alt="PapoLivre"
              className="drawer-logo"
            />

            <div>
              <h3>{userName}</h3>
              <span>{city}</span>
            </div>

          </div>

          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>

        </div>

        <nav className="drawer-menu">

          <button onClick={onHome}>
            <span className="drawer-menu-icon">
              <House size={18} />
            </span>
            Home
          </button>

          <button onClick={() => { onClose(); onSearch(); }}>
            <span className="drawer-menu-icon">
              <Search size={18} />
            </span>
            Pesquisar Salas
          </button>

          <button onClick={onProfile}>
            <span className="drawer-menu-icon">
              <User size={18} />
            </span>
            Meu Perfil
          </button>

          <button onClick={onBenefits}>
            <span className="drawer-menu-icon" style={{ color: "#a78bfa" }}>
              <PackageOpen size={18} />
            </span>
            Benefícios
          </button>

          <button onClick={onPremium} className="drawer-menu-premium">
            <span className="drawer-menu-icon drawer-menu-icon--premium">
              <Crown size={18} />
            </span>
            Premium
            <span className="drawer-premium-badge">PRO</span>
          </button>

        </nav>

        <div className="drawer-footer">

          <button
            className="logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Sair da conta
          </button>

          <div className="drawer-legal-links">
            <button onClick={onAbout}>
              <Info size={13} />
              Sobre v2.0
            </button>
            <span>·</span>
            <button onClick={onPrivacy}>
              <ShieldCheck size={13} />
              Privacidade
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}

export default HomeDrawer;