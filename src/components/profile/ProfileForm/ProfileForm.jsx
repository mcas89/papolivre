import "./ProfileForm.css";
import { User, MapPin, CheckCircle, Lock } from "lucide-react";

function ProfileForm({ nickname, setNickname, city, setCity, onSave, saving = false, saved = false, isAnonymous = false }) {
  return (
    <form className="profile-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>

      {/* Apelido — editável por todos */}
      <div className="form-group">
        <label>Apelido</label>
        <div className="input-wrapper">
          <User size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Seu apelido..."
            value={nickname}
            maxLength={10}
            onChange={(e) => setNickname(e.target.value.substring(0, 10))}
          />
        </div>
      </div>

      {/* Cidade — bloqueada para anônimos */}
      <div className={`form-group ${isAnonymous ? "form-group--locked" : ""}`}>
        <label>
          Cidade
          {isAnonymous && (
            <span className="locked-badge">
              <Lock size={11} /> Somente conta registrada
            </span>
          )}
        </label>
        <div className="input-wrapper">
          <MapPin size={18} className="input-icon" />
          <input
            type="text"
            placeholder={isAnonymous ? "Faça cadastro para editar" : "Sua cidade..."}
            value={isAnonymous ? "" : city}
            disabled={isAnonymous}
            onChange={isAnonymous ? undefined : (e) => setCity(e.target.value)}
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
