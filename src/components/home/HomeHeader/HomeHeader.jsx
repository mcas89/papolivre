import "./HomeHeader.css";

import { Search, MessageCircle, Bell, Menu, X } from "lucide-react";

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
}) {

  const userName =
    user?.nickname ||
    user?.displayName ||
    "Visitante";

  return (
    <header className="home-header">

      {/* Linha superior: saudação + ícones */}
      <div className="header-top">

        <div className="header-user">
          <img
            src={logo}
            alt="PapoLivre"
            className="header-logo"
          />
          <div className="header-user-text">
            <span className="header-greeting">Olá,</span>
            <h2>{userName}</h2>
          </div>
        </div>

        <div className="header-actions">

          <button
            className={`icon-btn${searchOpen ? " icon-btn--active" : ""}`}
            onClick={onSearchToggle}
            aria-label="Pesquisar salas"
            title="Pesquisar salas"
          >
            <Search size={19} />
          </button>

          <button
            className="icon-btn"
            onClick={onRooms}
            aria-label="Minhas Salas"
            title="Minhas Salas"
          >
            <MessageCircle size={19} />
          </button>

          <button
            className="icon-btn"
            onClick={onNotifications}
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell size={19} />
          </button>

          <button
            className="icon-btn icon-btn--menu"
            onClick={onMenu}
            aria-label="Menu"
            title="Menu"
          >
            <Menu size={19} />
          </button>

        </div>

      </div>

      {/* Campo de busca expansível */}
      <div className={`header-search-wrapper${searchOpen ? " header-search-wrapper--open" : ""}`}>
        <div className="header-search-bar">

          <Search size={17} className="search-icon-inline" />

          <input
            id="room-search-input"
            type="text"
            className="header-search-input"
            placeholder="Pesquisar salas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus={searchOpen}
            autoComplete="off"
          />

          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
            >
              <X size={15} />
            </button>
          )}

        </div>
      </div>

    </header>
  );
}

export default HomeHeader;