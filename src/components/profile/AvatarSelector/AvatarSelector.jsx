import "./AvatarSelector.css";
import { useState } from "react";
import { Edit2 } from "lucide-react";

// Lista inicial de emojis como avatares
const EMOJI_AVATARS = [
  "👤", "👨🏻", "👨🏿", "👨🏻‍🦲", "👨🏿‍🦲", 
  "👨🏻‍🦱", "👨🏿‍🦱", "👨🏻‍🦳", "👨🏿‍🦳",
  "👩🏻", "👩🏿", "👩🏻‍🦰", "👩🏿‍🦰", 
  "👩🏻‍🦱", "👩🏿‍🦱", "👩🏻‍🦳", "👩🏿‍🦳",
  "🦊", "🐱", "🐶", "🐼", 
  "🦁", "🐯", "🐰", "🐻"
];

function AvatarSelector({ currentAvatar, onAvatarChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="avatar-selector-container">
      <div className="avatar-preview-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar-preview">
          {currentAvatar || "👤"}
        </div>
        <div className="avatar-edit-badge">
          <Edit2 size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="avatar-grid">
          {EMOJI_AVATARS.map((emoji, index) => (
            <button
              key={index}
              className={`avatar-option ${currentAvatar === emoji ? "selected" : ""}`}
              onClick={() => {
                onAvatarChange(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvatarSelector;
