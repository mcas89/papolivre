import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Heart, CheckCircle } from "lucide-react";
import "./Support.css";
import { useToast } from "../../context/ToastContext";

function Support() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const pixEmail = "marcos.mcas89@gmail.com"; 

  const handleCopy = () => {
    navigator.clipboard.writeText(pixEmail);
    setCopied(true);
    showToast("Chave PIX copiada!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="support-page">
      <header className="support-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Apoie o PapoLivre</h1>
      </header>

      <div className="support-content-area">
        <div className="support-card-main">
          <Heart className="support-heart-icon" size={48} />
          <h2>Faça uma Doação</h2>
          <p className="support-description">
            O PapoLivre é mantido com muito carinho. Se você gosta do projeto e quer ajudar a manter os servidores online e sem anúncios chatos, considere fazer uma doação via PIX! Qualquer valor ajuda.
          </p>

          <div className="pix-area">
            <span className="pix-label">Chave PIX (E-mail)</span>
            <div className="pix-copy-box" onClick={handleCopy}>
              <span className="pix-key">{pixEmail}</span>
              {copied ? <CheckCircle size={20} color="#10b981" /> : <Copy size={20} />}
            </div>
            <p className="pix-hint">Toque para copiar a chave</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
