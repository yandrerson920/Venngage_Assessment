const Replicate = require('replicate');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('ERROR: REPLICATE_API_TOKEN not found in environment variables!');
  console.error('Make sure .env file exists in the project root with REPLICATE_API_TOKEN=your_token');
} else {
  console.log('✅ Replicate API token loaded successfully (length:', process.env.REPLICATE_API_TOKEN.length, ')');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateIcon(prompt, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Generating icon (attempt ${attempt}/${maxRetries}): "${prompt.substring(0, 50)}..."`);

      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "png",
            output_quality: 90,
          }
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from Replicate');
      }

      console.log(`Successfully generated icon on attempt ${attempt}`);
      return imageUrl;

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (error.message.includes('Invalid input') || 
          error.message.includes('validation')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed to generate icon after ${maxRetries} retries: ${lastError.message}`);
}

async function generateIconSet(prompts) {
  if (!Array.isArray(prompts) || prompts.length !== 4) {
    throw new Error('Exactly 4 prompts are required');
  }

  console.log('Starting parallel generation of 4 icons...');
  const startTime = Date.now();

  try {
    const iconPromises = prompts.map(async (prompt, index) => {
      try {
        const url = await generateIcon(prompt);
        return {
          id: index + 1,
          url,
          prompt
        };
      } catch (error) {
        console.error(`Failed to generate icon ${index + 1}:`, error.message);
        throw error;
      }
    });

    const icons = await Promise.all(iconPromises);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Successfully generated ${icons.length} icons in ${duration}s`);
    
    return icons;

  } catch (error) {
    console.error('Error generating icon set:', error);
    throw new Error(`Icon generation failed: ${error.message}`);
  }
}

async function healthCheck() {
  try {
    await replicate.models.list();
    return true;
  } catch (error) {
    console.error('Replicate health check failed:', error);
    return false;
  }
}

module.exports = {
  generateIcon,
  generateIconSet,
  healthCheck,
};
