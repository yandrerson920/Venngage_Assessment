import React, { useState, useCallback, useMemo, memo } from 'react';
import { GenerationRequest, PresetStyle } from '../types';

interface IconGeneratorFormProps {
  onGenerate: (request: GenerationRequest) => void;
  loading: boolean;
}

const PRESET_STYLES: { value: PresetStyle; label: string; emoji: string }[] = [
  { value: 'sticker', label: 'Sticker', emoji: '🚀' },
  { value: 'pastels', label: 'Pastels', emoji: '🌸' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'cartoon', label: 'Cartoon', emoji: '😊' },
  { value: '3d-model', label: '3D Model', emoji: '🎯' },
  { value: 'gradient', label: 'Gradient', emoji: '🌈' },
];

const EXAMPLE_PROMPTS = [
  'Hockey equipment',
  'Coffee shop items',
  'Fitness and wellness',
  'Travel destinations',
  'Music instruments',
  'Office supplies'
];

// Memoized Style Button Component
const StyleButton = memo(({ 
  style, 
  currentStyle, 
  onSelect, 
  disabled 
}: { 
  style: typeof PRESET_STYLES[0]; 
  currentStyle: PresetStyle; 
  onSelect: (value: PresetStyle) => void;
  disabled: boolean;
}) => {
  const isActive = currentStyle === style.value;
  
  return (
    <button
      type="button"
      onClick={() => onSelect(style.value)}
      disabled={disabled}
      className={`style-button ${isActive ? 'active' : ''}`}
    >
      <span className="style-emoji">{style.emoji}</span>
      <span className="style-label">{style.label}</span>
    </button>
  );
});

StyleButton.displayName = 'StyleButton';

// Memoized Color Input Component
const ColorInput = memo(({ 
  color, 
  index, 
  onUpdate, 
  onRemove, 
  showRemove, 
  disabled 
}: {
  color: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
  disabled: boolean;
}) => {
  return (
    <div className="color-input-group">
      <input
        type="text"
        placeholder="#FF5733"
        value={color}
        onChange={(e) => onUpdate(index, e.target.value)}
        disabled={disabled}
        pattern="^#[0-9A-Fa-f]{6}$"
        className="color-input"
      />
      <input
        type="color"
        value={color || '#000000'}
        onChange={(e) => onUpdate(index, e.target.value)}
        disabled={disabled}
        className="color-picker"
      />
      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disabled}
          className="remove-color-btn"
        >
          ✕
        </button>
      )}
    </div>
  );
});

ColorInput.displayName = 'ColorInput';

const IconGeneratorForm: React.FC<IconGeneratorFormProps> = ({ onGenerate, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<PresetStyle>('sticker');
  const [colorInputs, setColorInputs] = useState<string[]>(['']);
  const [useColors, setUseColors] = useState(false);

  // Memoized handlers
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const colors = useColors 
      ? colorInputs.filter(c => c.trim() !== '' && /^#[0-9A-Fa-f]{6}$/.test(c.trim()))
      : undefined;

    onGenerate({ prompt: prompt.trim(), style, colors });
  }, [prompt, style, colorInputs, useColors, onGenerate]);

  const addColorInput = useCallback(() => {
    if (colorInputs.length < 4) {
      setColorInputs(prev => [...prev, '']);
    }
  }, [colorInputs.length]);

  const removeColorInput = useCallback((index: number) => {
    setColorInputs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateColor = useCallback((index: number, value: string) => {
    setColorInputs(prev => {
      const newColors = [...prev];
      newColors[index] = value;
      return newColors;
    });
  }, []);

  const handleExampleClick = useCallback((example: string) => {
    setPrompt(example);
  }, []);

  // Memoized computed values
  const isFormValid = useMemo(() => prompt.trim().length > 0, [prompt]);
  const canAddColor = useMemo(() => colorInputs.length < 4, [colorInputs.length]);
  const shouldShowRemove = useMemo(() => colorInputs.length > 1, [colorInputs.length]);

  return (
    <form onSubmit={handleSubmit} className="card">
      {/* Prompt Input */}
      <div className="form-section">
        <label htmlFor="prompt" className="form-label">
          Icon Set Theme
        </label>
        <input
          id="prompt"
          type="text"
          placeholder="e.g., Hockey equipment, Coffee shop items..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          maxLength={200}
          className="form-input"
        />
        
        {/* Example Prompts */}
        <div className="example-prompts">
          <span className="example-label">Try:</span>
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={loading}
              className="example-chip"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div className="form-section">
        <label className="form-label">
          Preset Style
        </label>
        <div className="style-grid">
          {PRESET_STYLES.map((presetStyle) => (
            <StyleButton
              key={presetStyle.value}
              style={presetStyle}
              currentStyle={style}
              onSelect={setStyle}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Brand Colors */}
      <div className="form-section">
        <div className="color-header">
          <label className="form-label">
            <input
              type="checkbox"
              id="useColors"
              checked={useColors}
              onChange={(e) => setUseColors(e.target.checked)}
              disabled={loading}
              className="color-checkbox"
            />
            Brand Colors (Optional)
          </label>
        </div>
        
        {useColors && (
          <div className="color-inputs">
            {colorInputs.map((color, index) => (
              <ColorInput
                key={index}
                color={color}
                index={index}
                onUpdate={updateColor}
                onRemove={removeColorInput}
                showRemove={shouldShowRemove}
                disabled={loading}
              />
            ))}
            {canAddColor && (
              <button
                type="button"
                onClick={addColorInput}
                disabled={loading}
                className="add-color-btn"
              >
                + Add Color
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="generate-button"
      >
        {loading ? 'Generating...' : '✨ Generate Icon Set'}
      </button>
    </form>
  );
};

export default memo(IconGeneratorForm);

