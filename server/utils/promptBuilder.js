const STYLE_CONFIGS = {
  sticker: {
    suffix: 'cute sticker style, vibrant colors, glossy finish, white border, flat design, simple shapes, playful',
    keywords: ['adorable', 'cheerful', 'bright', 'fun']
  },
  pastels: {
    suffix: 'soft pastel colors, gentle shading, smooth gradients, light purple and blue tones, minimalist, clean lines, dreamy aesthetic',
    keywords: ['soft', 'delicate', 'light', 'airy']
  },
  business: {
    suffix: 'professional business icon style, teal and navy blue colors, circular badge design, clean minimal, corporate aesthetic',
    keywords: ['professional', 'modern', 'sleek', 'refined']
  },
  cartoon: {
    suffix: 'kawaii cartoon style, cute face with expression, warm orange and yellow colors, chibi proportions, friendly and approachable',
    keywords: ['playful', 'happy', 'cute', 'friendly']
  },
  '3d-model': {
    suffix: 'isometric 3D icon style, navy blue and orange accents, depth and shadows, modern tech aesthetic, clean geometric shapes',
    keywords: ['dimensional', 'geometric', 'polished', 'technical']
  },
  gradient: {
    suffix: 'vibrant gradient style, purple to pink to orange colors, modern flat design, smooth color transitions, energetic',
    keywords: ['colorful', 'dynamic', 'bold', 'contemporary']
  }
};

function hexToColorName(hex) {
  const colorMap = {
    '#000000': 'black', '#FFFFFF': 'white', '#FF0000': 'red',
    '#00FF00': 'lime green', '#0000FF': 'blue', '#FFFF00': 'yellow',
    '#FF00FF': 'magenta', '#00FFFF': 'cyan', '#FFA500': 'orange',
    '#800080': 'purple', '#008000': 'green', '#FFC0CB': 'pink',
    '#A52A2A': 'brown', '#808080': 'gray', '#C0C0C0': 'silver',
    '#FFD700': 'gold', '#4B0082': 'indigo', '#EE82EE': 'violet'
  };
  
  const upper = hex.toUpperCase();
  if (colorMap[upper]) return colorMap[upper];
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (r > 200 && g > 200 && b > 200) return 'light gray';
  if (r < 50 && g < 50 && b < 50) return 'dark gray';
  if (r > g && r > b) return g > 100 ? 'orange-red' : 'red';
  if (g > r && g > b) return 'green';
  if (b > r && b > g) return r > 100 ? 'purple-blue' : 'blue';
  if (r > 150 && g > 150) return 'yellow';
  if (r > 150 && b > 150) return 'pink';
  if (g > 150 && b > 150) return 'cyan';
  
  return `${hex} color`;
}

function buildColorDirective(colors) {
  if (!colors || colors.length === 0) {
    return { directive: '', override: '' };
  }

  const colorNames = colors.map(hex => hexToColorName(hex));
  
  const directive = `IMPORTANT: Use ONLY these exact colors: ${colorNames.join(', ')}. ` +
                   `Primary color must be ${colorNames[0]}. ` +
                   `Do not use any other colors.`;
  
  const override = `colored in ${colorNames.join(' and ')}`;
  
  return { directive, override };
}

function buildPrompts(mainPrompt, style, colors) {
  const styleConfig = STYLE_CONFIGS[style.toLowerCase()] || STYLE_CONFIGS.sticker;
  const { directive: colorDirective, override: colorOverride } = buildColorDirective(colors);
  
  const items = [
    `${mainPrompt} icon 1`,
    `${mainPrompt} icon 2`, 
    `${mainPrompt} icon 3`,
    `${mainPrompt} icon 4`
  ];

  let styleSuffix = styleConfig.suffix;
  if (colorOverride) {
    styleSuffix = styleSuffix
      .replace(/vibrant colors?/gi, colorOverride)
      .replace(/soft pastel colors?/gi, colorOverride)
      .replace(/teal and navy blue colors?/gi, colorOverride)
      .replace(/warm orange and yellow colors?/gi, colorOverride)
      .replace(/purple to pink to orange colors?/gi, colorOverride)
      .replace(/navy blue and orange/gi, colorOverride);
  }

  const prompts = items.map((item, index) => {
    const keyword = styleConfig.keywords[index % styleConfig.keywords.length];
    
    const basePrompt = colorDirective 
      ? `${colorDirective} A ${keyword} ${item}`
      : `A ${keyword} ${item}`;
    
    return `${basePrompt}, 512x512 icon, ${styleSuffix}, consistent style, matching aesthetic, single object on transparent or white background, centered composition, high quality, detailed`;
  });

  console.log('Generated prompts with colors:', prompts);
  return prompts;
}

module.exports = {
  buildPrompts,
  STYLE_CONFIGS
};
