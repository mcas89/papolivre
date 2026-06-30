import "./SupportCard.css";

import {
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

function SupportCard({ onClick }) {
  return (
    <section
      className="support-card"
      onClick={onClick}
    >
      <div className="support-icon">
        <HeartHandshake size={18} />
      </div>

      <div className="support-content">
        <h2>Apoie o PapoLivre</h2>
        <p>Sua contribuição ajuda a manter o projeto online.</p>
      </div>

      <div className="support-arrow">
        <ArrowRight size={15} />
      </div>

    </section>
  );
}

export default SupportCard;
