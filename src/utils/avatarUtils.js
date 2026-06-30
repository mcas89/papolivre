import { createAvatar } from '@dicebear/core';
import { lorelei, avataaars } from '@dicebear/collection';

/**
 * Checks if the avatar data is a legacy emoji string.
 * Legacy avatars are simple strings like "👦🏻", whereas new avatars
 * are objects with a seed property (e.g. { seed: "...", premium: false }).
 */
export function isLegacyAvatar(avatarData) {
  if (!avatarData) return false;
  return typeof avatarData === 'string' && !avatarData.startsWith('data:image');
}

/**
 * Returns a fallback avatar object for users who only have a legacy emoji.
 * Uses their UID (if provided) as a seed so it's consistent.
 */
export function getDefaultAvatarData(uid = 'default') {
  return {
    seed: uid,
    premium: false,
    options: {}
  };
}

/**
 * Generates the SVG string or Data URI from the avatarData object.
 */
export function generateAvatar(avatarData, { format = 'dataUri' } = {}) {
  if (!avatarData) return null;

  // If it's legacy, we don't generate an SVG for it
  if (isLegacyAvatar(avatarData)) {
    return avatarData;
  }

  try {
    const style = avatarData.premium ? avataaars : lorelei;
    const avatar = createAvatar(style, {
      seed: avatarData.seed || 'default',
      ...avatarData.options
    });

    if (format === 'svg') {
      return avatar.toString();
    }
    
    return avatar.toDataUri();
  } catch (error) {
    console.error("Error generating avatar:", error);
    return null;
  }
}
