import React, { useState, useEffect } from 'react';
import './DiceBearPicker.css';
import { ChevronLeft, ChevronRight, Dices, Save, Sparkles, X } from 'lucide-react';
import UserAvatar from "../../ui/UserAvatar/UserAvatar";

// Configuration
const FREE_LIMIT = 100;
const PREMIUM_LIMIT = 500;

function DiceBearPicker({ isPremium = false, initialAvatar, onSave, onClose }) {
  const [mode, setMode] = useState('preset'); // 'preset' or 'studio'
  const [presetIndex, setPresetIndex] = useState(1);
  const [studioOptions, setStudioOptions] = useState(initialAvatar?.options || {});
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
          <div className="dicebear-studio-controls">
            <p className="dicebear-studio-info">
              Estúdio de Avatar (Em breve: personalização completa de Pele, Cabelo, Roupas, etc)
            </p>
            <button className="dicebear-random-btn" onClick={handleRandom} style={{width: '100%', marginBottom: 12}}>
              <Dices size={18} />
              Gerar Aleatório
            </button>
            {/* Here we would map the huge amount of options from @dicebear/avataaars */}
            {/* For now keeping it simple as randomizing the custom seed */}
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
