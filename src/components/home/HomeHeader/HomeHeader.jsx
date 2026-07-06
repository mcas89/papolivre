import "./HomeHeader.css";

import { Search, MessageCircle, Bell, Menu, X, User } from "lucide-react";

import logo from "../../../assets/logo/logo01.png";

function HomeHeader({
  user,
  onMenu,
  onRooms,
  onNotifications,
  searchOpen,
  onSearchToggle,
  searchQuery,
  onSearchChange,
  unreadCount = 0,
}) {

  const userName =
    user?.nickname ||
    user?.displayName ||
    "Visitante";

  const userPhoto = user?.photoURL || null;

  return (
    <header className="home-header">

      {/* Linha superior: Avatar + Saudação + Ações */}
      <div className="header-top">

        <div className="header-user">
          {userPhoto ? (
            <img src={userPhoto} alt="Perfil" className="header-avatar" />
          ) : (
            <img src={logo} alt="PapoLivre" className="header-logo-icon" />
          )}
          <div className="header-user-text">
            <span className="header-greeting">Olá,</span>
            <h2>{userName}</h2>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={onRooms}
            aria-label="Minhas Salas"
            title="Minhas Salas"
          >
            <MessageCircle size={22} />
            {unreadCount > 0 && (
              <span className="badge-notification">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          <button
            className="icon-btn"
            onClick={onNotifications}
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell size={22} />
          </button>

          <button
            className="icon-btn icon-btn--menu"
            onClick={onMenu}
            aria-label="Menu"
            title="Menu"
          >
            <Menu size={22} />
          </button>
        </div>

      </div>

      {/* Barra de Pesquisa Perene (Search Bar moderna) */}
      <div className="header-search-container">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            id="room-search-input"
            type="text"
            className="search-input"
            placeholder="Pesquisar salas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

    </header>
  );
}

export default HomeHeader;