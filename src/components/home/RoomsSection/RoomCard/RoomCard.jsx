import { useState, useEffect } from "react";
import "./RoomCard.css";

import { Flame, Users, Clock, AlertTriangle } from "lucide-react";

// ==========================================
// CONFIGURAÇÃO DE IMAGENS POR TEMA
// ==========================================
// Você pode alterar estas URLs para as imagens que você mesmo escolher.
// Sites recomendados para pegar fotos bonitas: Unsplash.com, Pexels.com, Pixabay.com
// Basta copiar o "Endereço da Imagem" e colar dentro das aspas abaixo!
const THEME_IMAGES = {
  tecnologia: [
    "https://loremflickr.com/400/200/technology,coding/all?lock=1",
    "https://loremflickr.com/400/200/technology,coding/all?lock=2",
    "https://loremflickr.com/400/200/technology,coding/all?lock=3",
    "https://loremflickr.com/400/200/technology,coding/all?lock=4",
    "https://loremflickr.com/400/200/technology,coding/all?lock=5",
  ],
  amor: [
    "https://loremflickr.com/400/200/heart,love/all?lock=1",
    "https://loremflickr.com/400/200/couple,romantic/all?lock=2",
    "https://loremflickr.com/400/200/hearts,red/all?lock=3",
    "https://loremflickr.com/400/200/couple,kiss/all?lock=4",
    "https://loremflickr.com/400/200/couple,hug/all?lock=5",
  ],
  saude: [
    "https://loremflickr.com/400/200/fitness,health/all?lock=1",
    "https://loremflickr.com/400/200/fitness,health/all?lock=2",
    "https://loremflickr.com/400/200/fitness,health/all?lock=3",
    "https://loremflickr.com/400/200/fitness,health/all?lock=4",
    "https://loremflickr.com/400/200/fitness,health/all?lock=5",
  ],
  sao_paulo: [
    "https://loremflickr.com/400/200/saopaulo,city/all?lock=1",
    "https://loremflickr.com/400/200/saopaulo,city/all?lock=2",
    "https://loremflickr.com/400/200/saopaulo,city/all?lock=3",
    "https://loremflickr.com/400/200/saopaulo,city/all?lock=4",
    "https://loremflickr.com/400/200/saopaulo,city/all?lock=5",
  ],
  festa: [
    "https://loremflickr.com/400/200/party,club/all?lock=1",
    "https://loremflickr.com/400/200/party,club/all?lock=2",
    "https://loremflickr.com/400/200/party,club/all?lock=3",
    "https://loremflickr.com/400/200/party,club/all?lock=4",
    "https://loremflickr.com/400/200/party,club/all?lock=5",
  ],
  musica: [
    "https://loremflickr.com/400/200/music,concert/all?lock=1",
    "https://loremflickr.com/400/200/music,concert/all?lock=2",
    "https://loremflickr.com/400/200/music,concert/all?lock=3",
    "https://loremflickr.com/400/200/music,concert/all?lock=4",
    "https://loremflickr.com/400/200/music,concert/all?lock=5",
  ],
  jogos: [
    "https://loremflickr.com/400/200/gaming,esports/all?lock=1",
    "https://loremflickr.com/400/200/gaming,esports/all?lock=2",
    "https://loremflickr.com/400/200/gaming,esports/all?lock=3",
    "https://loremflickr.com/400/200/gaming,esports/all?lock=4",
    "https://loremflickr.com/400/200/gaming,esports/all?lock=5",
  ],
  filme: [
    "https://loremflickr.com/400/200/cinema,movie/all?lock=1",
    "https://loremflickr.com/400/200/cinema,movie/all?lock=2",
    "https://loremflickr.com/400/200/cinema,movie/all?lock=3",
    "https://loremflickr.com/400/200/cinema,movie/all?lock=4",
    "https://loremflickr.com/400/200/cinema,movie/all?lock=5",
  ],
  futebol: [
    "https://loremflickr.com/400/200/sports,football/all?lock=1",
    "https://loremflickr.com/400/200/sports,football/all?lock=2",
    "https://loremflickr.com/400/200/sports,football/all?lock=3",
    "https://loremflickr.com/400/200/sports,football/all?lock=4",
    "https://loremflickr.com/400/200/sports,football/all?lock=5",
  ],
  // Fallbacks genéricos (se a sala não tiver nenhum dos temas acima)
  geral: [
    "https://loremflickr.com/400/200/friends,group/all?lock=1",
    "https://loremflickr.com/400/200/abstract,neon/all?lock=1",
    "https://loremflickr.com/400/200/event,party/all?lock=1",
    "https://loremflickr.com/400/200/cyberpunk,city/all?lock=1",
    "https://loremflickr.com/400/200/people,laughing/all?lock=1"
  ]
};

function getRoomImagesArray(roomName, roomDesc) {
  const text = `${roomName} ${roomDesc}`.toLowerCase();
  
  if (text.includes("tecnologia") || text.includes("dev") || text.includes("program")) return THEME_IMAGES.tecnologia;
  if (text.includes("amor") || text.includes("namoro") || text.includes("casal") || text.includes("crush") || text.includes("relacionamento")) return THEME_IMAGES.amor;
  if (text.includes("saude") || text.includes("saúde") || text.includes("bem estar") || text.includes("bem-estar") || text.includes("fitness")) return THEME_IMAGES.saude;
  if (text.includes("são paulo") || text.includes("sao paulo") || text.includes(" sp")) return THEME_IMAGES.sao_paulo;
  if (text.includes("festa") || text.includes("balada") || text.includes("role")) return THEME_IMAGES.festa;
  if (text.includes("música") || text.includes("rock") || text.includes("pop")) return THEME_IMAGES.musica;
  if (text.includes("jogo") || text.includes("game") || text.includes("rpg")) return THEME_IMAGES.jogos;
  if (text.includes("filme") || text.includes("cinema") || text.includes("série")) return THEME_IMAGES.filme;
  if (text.includes("futebol") || text.includes("esporte")) return THEME_IMAGES.futebol;

  return THEME_IMAGES.geral;
}

function RoomCard({ room, onClick }) {
  let daysRemaining = null;
  if (room.isCustom && room.expiresAt) {
    const expTime = room.expiresAt?.toMillis ? room.expiresAt.toMillis() : new Date(room.expiresAt).getTime();
    daysRemaining = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
  }
  
  let isHighlighted = false;
  if (room.highlightedUntil) {
    const highTime = room.highlightedUntil?.toMillis ? room.highlightedUntil.toMillis() : new Date(room.highlightedUntil).getTime();
    if (highTime > Date.now()) isHighlighted = true;
  }

  // Obter array de imagens baseada no tema da sala
  const imageArray = getRoomImagesArray(room.name, room.description || "");
  
  // Estado para controlar a imagem atual
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efeito para trocar a imagem a cada minuto (60000 ms)
  useEffect(() => {
    // Definimos uma imagem aleatória inicial baseada no tempo atual para que as salas não girem todas de uma vez, 
    // ou usamos um índice inicial baseado no ID da sala para variedade imediata
    let hash = 0;
    const name = room.name || "";
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    setCurrentImageIndex(Math.abs(hash) % imageArray.length);

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
    }, 60000); // Muda a cada 1 minuto

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  }, [imageArray.length, room.name]);

  const coverUrl = imageArray[currentImageIndex];

  return (
    <article
      className={`room-gallery-card ${isHighlighted ? 'highlighted-room' : ''}`}
      onClick={() => onClick(room)}
    >
      <div className="room-cover-wrapper">
        <img src={coverUrl} alt="Capa da sala" className="room-cover-image" loading="lazy" />
        <div className="room-cover-overlay"></div>
        
        {/* Badges Flutuantes sobre a Imagem */}
        <div className="card-badges-top-right">
          {room.featured && (
            <div className="badge-featured" title="Sala em Alta">
              <Flame size={14} strokeWidth={2.5} />
            </div>
          )}
          {isHighlighted && (
            <div className="badge-highlight">
              Destacada
            </div>
          )}
          {daysRemaining !== null && (
             <div className="badge-expiry" style={{ 
               backgroundColor: daysRemaining <= 0 ? 'rgba(239, 68, 68, 0.15)' : (daysRemaining === 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
               color: daysRemaining <= 0 ? '#ef4444' : (daysRemaining === 1 ? '#f59e0b' : '#60a5fa')
             }}>
               {daysRemaining <= 0 ? <Flame size={12} /> : (daysRemaining === 1 ? <AlertTriangle size={12} /> : <Clock size={12} />)}
               <span>{daysRemaining <= 0 ? "Expira hoje" : (daysRemaining === 1 ? "1 dia" : `${daysRemaining} dias`)}</span>
             </div>
          )}
        </div>
      </div>

      <div className="card-info-section">
        <div className="card-text-content">
          <div className="card-title-row">
            <h3 className="card-title">{room.name}</h3>
            <div className="card-online-badge">
              <Users size={12} />
              <span>{room.online} Online</span>
            </div>
          </div>
          <p className="card-description">{room.description}</p>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;