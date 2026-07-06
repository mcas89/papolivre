import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import roomService from "../../../services/roomService";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useSystem } from "../../../context/SystemContext";
import "./CreateRoomModal.css";

function CreateRoomModal({ isOpen, onClose, onSuccess }) {
  const { user, isPremium } = useAuth();
  const { settings } = useSystem();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const cost = isPremium ? "GRÁTIS" : `${settings.roomPrice} Créditos`;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Por favor, informe o nome da sala.", "error");
      return;
    }
    if (!user || user.isAnonymous) {
      showToast("Apenas usuários registrados podem criar salas.", "error");
      return;
    }

    if (!isPremium && (user.credits || 0) < settings.roomPrice) {
      showToast(`Você precisa de ${settings.roomPrice} créditos para criar uma sala.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);
      const params = {
        name: name.trim(),
        icon: icon.trim() || "✨",
        description: description.trim(),
        tags: tagsArray
      };

      await roomService.createCustomRoom(user, params, isPremium);
      showToast("Sala criada com sucesso! Ela ficará disponível por 7 dias.", "success");
      
      // Limpa form e fecha
      setName("");
      setIcon("✨");
      setDescription("");
      setTags("");
      onSuccess(); // refresh rooms or navigate
      onClose();
    } catch (err) {
      showToast("Erro ao criar sala: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-room-overlay">
      <div className="create-room-modal">
        <button className="create-room-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="create-room-header">
          <Sparkles className="create-room-icon" size={24} />
          <h2>Criar Sala Temporária</h2>
        </div>

        <p className="create-room-subtitle">
          Sua sala ficará disponível para todos por 7 dias. Você será o dono dela!
        </p>

        {/* Live Preview */}
        <div className="create-room-preview">
          <label>Como sua sala vai aparecer:</label>
          <div className="preview-square-container">
            <div className="custom-room-square" style={{ pointerEvents: "none", margin: "0 auto" }}>
              <div className="custom-room-icon-wrapper">
                <span className="custom-room-emoji">{icon || "✨"}</span>
              </div>
              <h3 className="custom-room-name">{name || "Nome da Sala"}</h3>
              <div className="custom-room-online">
                <span style={{ fontSize: "10px" }}>0 online</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          <div className="form-group">
            <label>Ícone (Emoji)</label>
            <input 
              type="text" 
              maxLength={2} 
              value={icon} 
              onChange={e => setIcon(e.target.value)} 
              placeholder="✨"
            />
          </div>

          <div className="form-group">
            <label>Nome da Sala *</label>
            <input 
              type="text" 
              maxLength={30} 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ex: Fãs de Rock"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input 
              type="text" 
              maxLength={60} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Sobre o que é o papo?"
            />
          </div>

          <div className="form-group">
            <label>Tags (separadas por vírgula)</label>
            <input 
              type="text" 
              maxLength={50} 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              placeholder="rock, musica, bandas"
            />
          </div>

          <div className="create-room-actions">
            <div className="create-room-cost">
              Custo: <strong>{cost}</strong>
            </div>
            <button type="submit" className="create-room-btn" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Confirmar Criação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;
