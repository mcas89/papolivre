import "./ProfileHeader.css";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

function ProfileHeader() {
  const navigate = useNavigate();

  return (
    <header className="profile-header">
      <button 
        className="profile-back-btn" 
        onClick={() => navigate(ROUTES.HOME)}
      >
        <ArrowLeft size={24} />
      </button>
      
      <h1>Editar Perfil</h1>
      
      {/* Spacer to keep title centered */}
      <div className="header-spacer"></div>
    </header>
  );
}

export default ProfileHeader;
