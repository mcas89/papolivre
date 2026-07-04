export const EFFECT_CATEGORIES = {
  FESTA: "Festa",
  AMOR: "Amor",
  HUMOR: "Humor",
  REACOES: "Reações",
  CELEBRACAO: "Celebração",
  ESPECIAIS: "Especiais"
};

export const EFFECTS_CATALOG = [
  // Efeitos Free
  { id: "coracao", name: "Coração", category: EFFECT_CATEGORIES.AMOR, duration: 7000, cooldown: 60, premiumOnly: false, requiresPass: false, active: true },
  { id: "mandandobeijo", name: "Beijo", category: EFFECT_CATEGORIES.AMOR, duration: 4000, cooldown: 60, premiumOnly: false, requiresPass: false, active: true },
  { id: "dedo", name: "F#d@-se", category: EFFECT_CATEGORIES.HUMOR, duration: 4000, cooldown: 60, premiumOnly: false, requiresPass: false, active: true },

  // Efeitos Premium Pro
  { id: "linguasensual", name: "Sensual", category: EFFECT_CATEGORIES.ESPECIAIS, duration: 4000, cooldown: 60, premiumOnly: false, requiresPass: true, active: true },
  { id: "soco", name: "Soco", category: EFFECT_CATEGORIES.ESPECIAIS, duration: 7000, cooldown: 60, premiumOnly: false, requiresPass: true, active: true },
  { id: "noelpum", name: "Pum do Noel", category: EFFECT_CATEGORIES.HUMOR, duration: 8000, cooldown: 60, premiumOnly: false, requiresPass: true, active: true }
];
