import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";

import ProfileHeader from "../../components/profile/ProfileHeader/ProfileHeader";
import AvatarSelector from "../../components/profile/AvatarSelector/AvatarSelector";
import ProfileForm from "../../components/profile/ProfileForm/ProfileForm";
import SupportCard from "../../components/ui/SupportCard/SupportCard";
import CreditsCard from "../../components/profile/CreditsCard/CreditsCard";

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [avatar,   setAvatar]   = useState(user?.avatar   || "👤");
  const [nickname, setNickname] = useState(user?.nickname || user?.name || "");
  const [city,     setCity]     = useState(user?.city     || "");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  async function handleSave() {
    if (!user?.uid) return;
    setSaving(true);
    setSaved(false);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { avatar, nickname, city },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">

        <ProfileHeader />

        {/* CUIDADO COM ANÔNIMOS: só podem alterar avatar se tiver login completo, etc. Mas vamos manter o original */}
        <AvatarSelector
          currentAvatar={avatar}
          onAvatarChange={setAvatar}
          isAnonymous={user?.anonymous}
        />

        {!user?.anonymous && <CreditsCard user={user} />}

        <ProfileForm
          nickname={nickname}
          setNickname={setNickname}
          city={city}
          setCity={setCity}
          onSave={handleSave}
          saving={saving}
          saved={saved}
        />

        <div className="profile-support-section">
          <SupportCard onClick={() => navigate(ROUTES.PREMIUM)} />
        </div>

      </div>
    </main>
  );
}

export default Profile;