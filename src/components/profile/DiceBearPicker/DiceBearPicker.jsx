import React, { useState, useEffect } from 'react';
import './DiceBearPicker.css';
import { ChevronLeft, ChevronRight, Dices, Save, Sparkles, X } from 'lucide-react';
import UserAvatar from "../../ui/UserAvatar/UserAvatar";

// Configuration
const FREE_LIMIT = 100;
const PREMIUM_LIMIT = 500;

// DiceBear options mapping
const SKIN_COLORS = {
  "ffdbb4": "Muito Clara",
  "edb98a": "Clara",
  "fd9841": "Bronzeada",
  "f8d25c": "Amarelada",
  "d08b5b": "Parda Média",
  "ae5d29": "Parda Escura",
  "614335": "Escura"
};

const HAIR_STYLES = {
  bob: "Bob",
  bun: "Coque",
  curly: "Cacheado",
  curvy: "Ondulado",
  dreads: "Dreads",
  fro: "Black Power",
  longButNotTooLong: "Médio",
  shavedSides: "Raspado nas Laterais",
  straight01: "Liso Curto",
  straight02: "Liso Longo",
  shortCurly: "Curto Cacheado",
  shortFlat: "Curto Militar",
  shortRound: "Curto Arredondado",
  shortWaved: "Curto Ondulado",
  sides: "Entradas Laterais",
  hat: "Chapéu",
  winterHat1: "Touca"
};

const HAIR_COLORS = {
  "2c1b18": "Preto",
  "4a312c": "Castanho Escuro",
  "724133": "Castanho Médio",
  "a55728": "Ruivo",
  "b58143": "Loiro Escuro",
  "d6b370": "Loiro",
  "ecdcbf": "Loiro Claro",
  "f59797": "Rosa",
  "e8e1e1": "Cinza / Branco"
};

const FACIAL_HAIR = {
  "": "Nenhuma",
  beardLight: "Barba Rala",
  beardMedium: "Barba Média",
  beardMajestic: "Barba Cheia",
  moustacheFancy: "Bigode Curvado",
  moustacheMagnum: "Bigode Retrô"
};

const CLOTHINGS = {
  blazerAndShirt: "Blazer e Camisa",
  blazerAndSweater: "Blazer e Suéter",
  collarAndSweater: "Gola Alta",
  graphicShirt: "Camiseta Estampada",
  hoodie: "Moletom",
  overall: "Jardineira",
  shirtCrewNeck: "Camiseta Gola Redonda",
  shirtScoopNeck: "Camiseta Gola U",
  shirtVNeck: "Camiseta Gola V"
};

const CLOTHES_COLORS = {
  "262e33": "Cinza Escuro",
  "929598": "Cinza Claro",
  "ffffff": "Branco",
  "3c4f5c": "Azul Petróleo",
  "25557c": "Azul Escuro",
  "5199e4": "Azul",
  "65c9ff": "Azul Claro",
  "a7ffc4": "Verde Menta",
  "ffffb1": "Amarelo",
  "ffdeb5": "Pêssego",
  "ffafb9": "Rosa Claro",
  "ff488e": "Rosa Choque",
  "ff5c5c": "Vermelho"
};

const EYE_TYPES = {
  default: "Normal",
  closed: "Fechados",
  cry: "Chorando",
  eyeRoll: "Revirando",
  happy: "Felizes",
  hearts: "Corações",
  side: "Olhando pro lado",
  squint: "Semicerrados",
  surprised: "Surpreso",
  wink: "Piscando",
  xDizzy: "Tonto"
};

const MOUTH_TYPES = {
  default: "Normal",
  concerned: "Preocupado",
  disbelief: "Desconfiado",
  eating: "Comendo",
  grimace: "Careta",
  sad: "Triste",
  screamOpen: "Gritando",
  serious: "Sério",
  smile: "Sorriso",
  tongue: "Língua pra fora"
};

function DiceBearPicker({ isPremium = false, initialAvatar, onSave, onClose }) {
  const [mode, setMode] = useState('preset'); // 'preset' or 'studio'
  const [presetIndex, setPresetIndex] = useState(1);
  const [studioOptions, setStudioOptions] = useState(() => {
    const defaults = {
      skinColor: ['ffdbb4'],
      top: ['bob'],
      hairColor: ['2c1b18'],
      clothing: ['shirtCrewNeck'],
      clothesColor: ['5199e4'],
      eyes: ['default'],
      mouth: ['default'],
      facialHairProbability: 0
    };
    return { ...defaults, ...initialAvatar?.options };
  });
  const [studioSeed, setStudioSeed] = useState(initialAvatar?.seed || 'Custom_1');
  
  const totalPresets = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  // Initialize preset index if the user has a preset avatar
  useEffect(() => {
    if (initialAvatar && initialAvatar.seed && initialAvatar.seed.startsWith('Preset_')) {
      const idx = parseInt(initialAvatar.seed.replace('Preset_', ''), 10);
      if (!isNaN(idx) && idx >= 1 && idx <= totalPresets) {
        setPresetIndex(idx);
      } else if (!isPremium && !isNaN(idx) && idx > FREE_LIMIT) {
        setPresetIndex(1); // Reset if downgrade to free
      }
    }
  }, [initialAvatar, isPremium, totalPresets]);

  const handlePrev = () => {
    setPresetIndex(prev => prev > 1 ? prev - 1 : totalPresets);
  };

  const handleNext = () => {
    setPresetIndex(prev => prev < totalPresets ? prev + 1 : 1);
  };

  const handleRandom = () => {
    if (mode === 'preset') {
      const randomIdx = Math.floor(Math.random() * totalPresets) + 1;
      setPresetIndex(randomIdx);
    } else {
      setStudioSeed(`Custom_${Math.floor(Math.random() * 10000)}`);
    }
  };

  const handleSave = () => {
    if (mode === 'preset') {
      onSave({
        seed: `Preset_${presetIndex}`,
        premium: isPremium,
        options: {}
      });
    } else {
      onSave({
        seed: studioSeed,
        premium: true,
        options: studioOptions
      });
    }
  };

  const updateOption = (key, value) => {
    setStudioOptions(prev => ({
      ...prev,
      [key]: [value]
    }));
  };

  // Build the current avatar data for preview
  const previewData = mode === 'preset' 
    ? { seed: `Preset_${presetIndex}`, premium: isPremium, options: {} }
    : { seed: studioSeed, premium: true, options: studioOptions };

  return (
    <div className="dicebear-picker-overlay">
      <div className="dicebear-picker-modal">
        <div className="dicebear-picker-header">
          <h2>Escolher Avatar</h2>
          <button className="dicebear-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isPremium && (
          <div className="dicebear-mode-tabs">
            <button 
              className={`dicebear-tab ${mode === 'preset' ? 'active' : ''}`}
              onClick={() => setMode('preset')}
            >
              Presets
            </button>
            <button 
              className={`dicebear-tab ${mode === 'studio' ? 'active' : ''}`}
              onClick={() => setMode('studio')}
            >
              Avatar Studio <Sparkles size={14} style={{marginLeft: 4}} />
            </button>
          </div>
        )}

        <div className="dicebear-preview-area">
          <div className="dicebear-preview-box">
            <UserAvatar avatarData={previewData} size={140} />
          </div>
          
          {mode === 'preset' && (
            <p className="dicebear-preset-counter">
              Avatar {presetIndex} / {totalPresets}
            </p>
          )}
        </div>

        {mode === 'preset' && (
          <div className="dicebear-controls-row">
            <button className="dicebear-nav-btn" onClick={handlePrev}>
              <ChevronLeft size={24} />
            </button>
            
            <button className="dicebear-random-btn" onClick={handleRandom}>
              <Dices size={18} />
              Surpreenda-me
            </button>

            <button className="dicebear-nav-btn" onClick={handleNext}>
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {mode === 'studio' && (
          <div className="dicebear-studio-controls" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="studio-select-group">
              <label>Cor da Pele</label>
              <select 
                className="studio-select" 
                value={studioOptions.skinColor?.[0] || 'ffdbb4'} 
                onChange={(e) => updateOption('skinColor', e.target.value)}
              >
                {Object.entries(SKIN_COLORS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Cabelo</label>
              <select 
                className="studio-select" 
                value={studioOptions.top?.[0] || 'bob'} 
                onChange={(e) => updateOption('top', e.target.value)}
              >
                {Object.entries(HAIR_STYLES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Cor do Cabelo</label>
              <select 
                className="studio-select" 
                value={studioOptions.hairColor?.[0] || '2c1b18'} 
                onChange={(e) => updateOption('hairColor', e.target.value)}
              >
                {Object.entries(HAIR_COLORS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Barba</label>
              <select 
                className="studio-select" 
                value={studioOptions.facialHair?.[0] || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  setStudioOptions(prev => {
                    const next = { ...prev };
                    if (!val) {
                      delete next.facialHair;
                      next.facialHairProbability = 0;
                    } else {
                      next.facialHair = [val];
                      next.facialHairProbability = 100;
                    }
                    return next;
                  });
                }}
              >
                {Object.entries(FACIAL_HAIR).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Roupa</label>
              <select 
                className="studio-select" 
                value={studioOptions.clothing?.[0] || 'shirtCrewNeck'} 
                onChange={(e) => updateOption('clothing', e.target.value)}
              >
                {Object.entries(CLOTHINGS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Cor da Roupa</label>
              <select 
                className="studio-select" 
                value={studioOptions.clothesColor?.[0] || '5199e4'} 
                onChange={(e) => updateOption('clothesColor', e.target.value)}
              >
                {Object.entries(CLOTHES_COLORS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Olhos</label>
              <select 
                className="studio-select" 
                value={studioOptions.eyes?.[0] || 'default'} 
                onChange={(e) => updateOption('eyes', e.target.value)}
              >
                {Object.entries(EYE_TYPES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="studio-select-group">
              <label>Boca</label>
              <select 
                className="studio-select" 
                value={studioOptions.mouth?.[0] || 'default'} 
                onChange={(e) => updateOption('mouth', e.target.value)}
              >
                {Object.entries(MOUTH_TYPES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="dicebear-footer">
          <button className="dicebear-save-btn" onClick={handleSave}>
            <Save size={18} />
            Salvar Avatar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiceBearPicker;
