import "./EmptyState.css";
import { MessageSquare } from "lucide-react";

function EmptyState() {
  return (
    <div className="empty-state">
      <MessageSquare size={48} className="empty-icon" />
      <h3>Nenhuma mensagem ainda</h3>
      <p>Seja o primeiro a enviar uma mensagem e iniciar a conversa!</p>
    </div>
  );
}

export default EmptyState;
