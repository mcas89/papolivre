import "./FeaturedCard.css";

import {
  MapPin,
  ArrowRight,
} from "lucide-react";

function FeaturedCard({
  onlineUsers,
  onClick,
}) {
  return (
    <section
      className="featured-hero-card"
      onClick={onClick}
    >
      {/* Background Image of a glowing night city map or neon */}
      <div 
        className="featured-hero-bg" 
        style={{ backgroundImage: `url('https://loremflickr.com/800/400/city,night/all')` }}
      ></div>
      <div className="featured-hero-overlay"></div>

      <div className="featured-hero-content">
        <div className="featured-hero-top">
          {/* Badge removida a pedido do usuário */}
        </div>

        <div className="featured-hero-bottom">
          <div className="featured-hero-text">
            <h2>Pessoas Próximas</h2>
            <p>Converse com quem está ao seu redor agora mesmo.</p>
          </div>

          <div className="featured-hero-actions">
            <div className="featured-online-glow">
              <span className="online-dot-glow"></span>
              <span>{onlineUsers} Online</span>
            </div>
            
            <button className="featured-hero-btn">
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCard;