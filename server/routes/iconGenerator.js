const express = require('express');
const router = express.Router();
const { generateIconSet } = require('../services/replicateService');
const { buildPrompts } = require('../utils/promptBuilder');
const { getCachedIcons, cacheIcons } = require('../services/cacheService');
const { generateIconsLimiter } = require('../middleware/rateLimiter');

router.post('/generate-icons', generateIconsLimiter, async (req, res, next) => {
  try {
    const { prompt, style, colors } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: { message: 'Prompt is required and must be a non-empty string', status: 400 }
      });
    }

    if (!style || typeof style !== 'string') {
      return res.status(400).json({
        error: { message: 'Style is required and must be a string', status: 400 }
      });
    }

    if (prompt.trim().length > 500) {
      return res.status(400).json({
        error: { message: 'Prompt must be less than 500 characters', status: 400 }
      });
    }

    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({
        error: { message: 'Colors must be an array', status: 400 }
      });
    }

    console.log(`[${new Date().toISOString()}] Generating icon set - Prompt: "${prompt}", Style: ${style}`);

    const cached = getCachedIcons(prompt, style, colors);
    if (cached) {
      console.log('Returning cached result');
      return res.json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const prompts = buildPrompts(prompt, style, colors);
    const startTime = Date.now();
    const icons = await generateIconSet(prompts);
    const duration = Date.now() - startTime;

    const response = {
      success: true,
      icons,
      metadata: {
        prompt,
        style,
        colors,
        count: icons.length,
        generationTime: duration,
        timestamp: new Date().toISOString()
      },
      cached: false
    };

    cacheIcons(prompt, style, colors, response);

    console.log(`Successfully generated ${icons.length} icons in ${duration}ms`);
    res.json(response);

  } catch (error) {
    console.error('[Error] Icon generation failed:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: { 
          message: 'API rate limit exceeded. Please try again in a few moments.', 
          status: 429 
        }
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: { 
          message: 'Request timed out. The AI model is taking longer than expected. Please try again.', 
          status: 504 
        }
      });
    }
    
    next(error);
  }
});

module.exports = router;
