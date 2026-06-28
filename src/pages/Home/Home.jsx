import "./Home.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import useRoomSearch from "../../hooks/useRoomSearch";
import chatService from "../../services/chatService";

import { ROUTES } from "../../constants/routes";

import HomeDrawer from "../../components/home/HomeDrawer/HomeDrawer";
import HomeHeader from "../../components/home/HomeHeader/HomeHeader";
import MyRoomsPopup from "../../components/home/MyRoomsPopup/MyRoomsPopup";
import FeaturedCard from "../../components/home/FeaturedCard/FeaturedCard";
import RoomsSection from "../../components/home/RoomsSection/RoomsSection";
import SupportCard from "../../components/ui/SupportCard/SupportCard";
import PremiumLimitModal from "../../components/ui/PremiumLimitModal/PremiumLimitModal";

function Home() {
  const navigate = useNavigate();

  const { joinRoom, unreadRooms } = useChat();
  const { user, logout } = useAuth();

    // remove limite 5 salas no home
  const [showAllRooms, setShowAllRooms] = useState(false);

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomsOpen, setRoomsOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Premium modal state
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalType, setLimitModalType] = useState("rooms"); // "rooms" ou "full"

  // Quantidade de usuários online na sala de geolocalização do usuário atual
  const [geoOnlineCount, setGeoOnlineCount] = useState(0);

  // Busca de salas (hook com debounce + pronto para Firebase)
  const {
    query,
    setQuery,
    results,
    loading,
    hasQuery,
    setRoomOnlineCount,
  } = useRoomSearch();

  // Assina presença em tempo real para todas as salas visíveis
  useEffect(() => {
    if (!results.length) return;

    const unsubs = results.map((room) =>
      chatService.subscribePresence(room.id, (users) => {
        setRoomOnlineCount(room.id, users.length);
      })
    );

    return () => unsubs.forEach((fn) => fn());
  }, [results.map(r => r.id).join(",")]);

  // Escuta quantidade de pessoas online no quadrante geográfico em tempo real
  useEffect(() => {
    const location = user?.location;
    if (!location?.latitude || !location?.longitude) return;

    const geoStep = 0.18;
    const latIndex = Math.round(location.latitude / geoStep);
    const lngIndex = Math.round(location.longitude / geoStep);
    const myGeoRoomId = `geo_${latIndex}_${lngIndex}`;

    const unsubPresence = chatService.subscribePresence(myGeoRoomId, (users) => {
      setGeoOnlineCount(users.length);
    });

    return () => unsubPresence();
  }, [user?.location]);

  function handleSearchToggle() {
    setSearchOpen((prev) => !prev);
  }

  // Abre o campo de busca a partir do Drawer
  function handleDrawerSearch() {
    setSearchOpen(true);
  }

  async function handleFeaturedClick() {
    const res = await joinRoom("pessoas_proximas");
    if (!res.success) {
      if (res.error === "LIMITE_SALAS") {
        setLimitModalType("rooms");
        setLimitModalOpen(true);
      } else if (res.error === "SALA_CHEIA") {
        setLimitModalType("full");
        setLimitModalOpen(true);
      } else if (res.error === "SEM_GEOLOCALIZACAO") {
        try {
          const { requestApproximateLocation } = await import("../../utils/location");
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("../../firebase/config");
          
          const newLocation = await requestApproximateLocation();
          await setDoc(doc(db, "users", user.uid), { location: newLocation }, { merge: true });
          
          // A localização foi atualizada no Firebase. O AuthContext vai receber 
          // a atualização em tempo real, mas para não obrigar o usuário a clicar 
          // de novo, tentamos fazer o join com uma gambiarra temporária ou avisamos:
          alert("Localização obtida! Clique novamente para entrar na sala.");
        } catch (err) {
          alert("Por favor, ative a permissão de geolocalização no navegador para usar a sala de Pessoas Próximas.");
        }
      }
      return;
    }
    navigate(ROUTES.ROOM);
  }

  async function handleRoomClick(room) {
    const res = await joinRoom(room.id);
    if (!res.success) {
      if (res.error === "LIMITE_SALAS") {
        setLimitModalType("rooms");
        setLimitModalOpen(true);
      } else if (res.error === "SALA_CHEIA") {
        setLimitModalType("full");
        setLimitModalOpen(true);
      }
      return;
    }
    navigate(ROUTES.ROOM);
  }

  // Exibe apenas as primeiras 5 salas se não for busca ativa
  const topRooms = results;

  return (
    <main className="home">

      <HomeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onHome={() => navigate(ROUTES.HOME)}
        onSearch={handleDrawerSearch}
        onProfile={() => navigate(ROUTES.PROFILE)}
        onPremium={() => navigate(ROUTES.PREMIUM)}
        onLogout={logout}
        onAbout={() => { setDrawerOpen(false); navigate(ROUTES.ABOUT); }}
        onPrivacy={() => { setDrawerOpen(false); navigate(ROUTES.PRIVACY); }}
      />

      <MyRoomsPopup
        open={roomsOpen}
        onClose={() => setRoomsOpen(false)}
        unreadRooms={unreadRooms}
      />

      <PremiumLimitModal
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        type={limitModalType}
      />

      <HomeHeader
        user={user}
        onMenu={() => setDrawerOpen(true)}
        onRooms={() => setRoomsOpen(true)}
        unreadCount={unreadRooms?.length || 0}
        onNotifications={() => navigate(ROUTES.NOTIFICATIONS)}
        searchOpen={searchOpen}
        onSearchToggle={handleSearchToggle}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <FeaturedCard
        onlineUsers={geoOnlineCount}
        onClick={handleFeaturedClick}
      />

      <RoomsSection
        rooms={topRooms}
        loading={loading}
        hasQuery={hasQuery}
        showAll={showAllRooms}
        onToggleViewAll={() => setShowAllRooms(!showAllRooms)}
        onRoomClick={handleRoomClick}
      />

      <SupportCard
        onClick={() => navigate(ROUTES.PREMIUM)}
      />

    </main>
  );
}

export default Home;