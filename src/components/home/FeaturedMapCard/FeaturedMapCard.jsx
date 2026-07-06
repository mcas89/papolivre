import "./FeaturedMapCard.css";
import React from "react";
import { ArrowRight } from "lucide-react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../../context/AuthContext";

function FeaturedMapCard({ onlineUsers, onClick }) {
  const { user } = useAuth();
  
  // Coordenadas padrão (São Paulo) caso o usuário não tenha permitido o GPS
  const defaultCenter = [-23.5505, -46.6333];
  
  const userLat = user?.location?.latitude;
  const userLng = user?.location?.longitude;
  
  const hasLocation = userLat != null && userLng != null;
  const center = hasLocation ? [userLat, userLng] : defaultCenter;

  return (
    <section className="featured-hero-card" onClick={onClick}>
      
      {/* Background Map */}
      <div className="featured-hero-bg-map">
        <MapContainer 
          center={center} 
          zoom={9.5} 
          zoomSnap={0.1}
          zoomControl={false} 
          dragging={false} 
          scrollWheelZoom={false} 
          doubleClickZoom={false}
          touchZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* Círculo de 20km de raio */}
          <Circle 
            center={center} 
            pathOptions={{ 
              color: '#10b981', 
              fillColor: '#10b981', 
              fillOpacity: 0.2, 
              weight: 2,
              dashArray: "5, 5"
            }} 
            radius={20000} // 20.000 metros = 20km
          />
        </MapContainer>
      </div>
      
      <div className="featured-hero-overlay"></div>

      <div className="featured-hero-content">
        <div className="featured-hero-top">
          <div className="featured-hero-text">
            <h2>Pessoas Próximas</h2>
            <p>
              {hasLocation 
                ? "Conectando pessoas num raio de 20km da sua localização."
                : "Ative a localização para ver as pessoas na sua área."}
            </p>
          </div>
        </div>

        <div className="featured-hero-bottom">
          <div className="featured-online-glow">
            <span className="online-dot-glow"></span>
            <span>{onlineUsers} Online</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedMapCard;
