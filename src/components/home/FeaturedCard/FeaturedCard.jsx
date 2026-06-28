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
      className="featured-card"
      onClick={onClick}
    >
      <div className="featured-top-row">
        <div className="featured-icon">
          <MapPin size={28} />
        </div>

        <div className="featured-text-group">
          <h2>Pessoas Próximas</h2>
          <p>
            Converse com pessoas próximas.
          </p>
        </div>
      </div>

      <div className="featured-online">

        <span className="online-dot"></span>

        <span>
          {onlineUsers} pessoas online agora
        </span>

      </div>

      <div className="featured-arrow">

        <ArrowRight size={22} />

      </div>

    </section>
  );
}

export default FeaturedCard;