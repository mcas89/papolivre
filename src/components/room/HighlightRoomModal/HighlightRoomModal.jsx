import { useState, useEffect } from "react";
import { X, Flame } from "lucide-react";
import Button from "../../ui/Button/Button";
import roomService from "../../../services/roomService";
import { useAuth } from "../../../context/AuthContext";
import "./HighlightRoomModal.css";

function HighlightRoomModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [myRooms, setMyRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadMyRooms();
    }
  }, [isOpen, user?.uid]);

  async function loadMyRooms() {
    setIsLoading(true);
    setError("");
    try {
      const rooms = await roomService.getMyCustomRooms(user.uid);
      const activeRooms = rooms.filter(r => {
        const exp = r.expiresAt?.toMillis ? r.expiresAt.toMillis() : new Date(r.expiresAt).getTime();
        return exp > Date.now();
      });
      setMyRooms(activeRooms);
      if (activeRooms.length > 0) {
        setSelectedRoomId(activeRooms[0].id);
      }
    } catch (err) {
      setError("Erro ao carregar suas salas.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleHighlight() {
    if (!selectedRoomId) return;

    setIsLoading(true);
    setError("");

    try {
      await roomService.highlightRoom(user, selectedRoomId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Erro ao destacar a sala.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        <header className="modal-header">
          <h2>Destacar Sala</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="modal-body">
          
          <div className="highlight-banner">
            <Flame size={32} color="#f59e0b" />
            <p>Coloque sua sala no topo da lista por 24 horas e atraia muito mais participantes!</p>
          </div>

          {error && <div className="modal-error">{error}</div>}

          {myRooms.length === 0 && !isLoading && (
            <div className="no-rooms-msg">
              <p>Você não possui salas ativas para destacar.</p>
              <p>Crie uma sala primeiro!</p>
            </div>
          )}

          {myRooms.length > 0 && (
            <div className="form-group">
              <label>Selecione a sala para destacar:</label>
              <select 
                value={selectedRoomId} 
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={isLoading}
              >
                {myRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

        </div>

        <footer className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleHighlight} 
            disabled={isLoading || myRooms.length === 0}
          >
            {isLoading ? "Processando..." : "Destacar (15 Créditos)"}
          </Button>
        </footer>

      </div>
    </div>
  );
}

export default HighlightRoomModal;
