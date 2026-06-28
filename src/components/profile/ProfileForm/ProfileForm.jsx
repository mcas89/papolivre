import "./ProfileForm.css";
import { User, MapPin, CheckCircle } from "lucide-react";

function ProfileForm({ nickname, setNickname, city, setCity, onSave, saving = false, saved = false }) {
  return (
    <form className="profile-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      
      <div className="form-group">
        <label>Apelido</label>
        <div className="input-wrapper">
          <User size={20} className="input-icon" />
          <input 
            type="text" 
            placeholder="Seu apelido..." 
            value={nickname}
            maxLength={10}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Cidade</label>
        <div className="input-wrapper">
          <MapPin size={20} className="input-icon" />
          <input 
            type="text" 
            placeholder="Sua cidade..." 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`profile-save-btn ${saved ? "profile-save-btn--saved" : ""}`}
        disabled={saving}
      >
        {saving ? "Salvando..." : saved ? (
          <><CheckCircle size={16} /> Salvo!</>
        ) : "Salvar Alterações"}
      </button>

    </form>
  );
}

export default ProfileForm;
