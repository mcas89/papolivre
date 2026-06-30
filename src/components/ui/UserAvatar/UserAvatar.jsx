import React, { useMemo } from 'react';
import './UserAvatar.css';
import { isLegacyAvatar, generateAvatar, getDefaultAvatarData } from '../../../utils/avatarUtils';

function UserAvatar({ avatarData, size = 40, className = '', fallbackUid = 'default' }) {
  const avatarToRender = useMemo(() => {
    if (!avatarData) {
      return getDefaultAvatarData(fallbackUid);
    }
    return avatarData;
  }, [avatarData, fallbackUid]);

  const isLegacy = isLegacyAvatar(avatarToRender);
  
  // If it's a legacy emoji avatar
  if (isLegacy) {
    return (
      <div 
        className={`user-avatar-emoji ${className}`} 
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {avatarToRender}
      </div>
    );
  }

  // If it's a new DiceBear avatar
  const dataUri = generateAvatar(avatarToRender);

  return (
    <div className={`user-avatar-wrapper ${className}`} style={{ width: size, height: size }}>
      <img src={dataUri} alt="Avatar" className="user-avatar-image" />
    </div>
  );
}

export default UserAvatar;
