const NodeCache = require('node-cache');

const cache = new NodeCache({ 
  stdTTL: 3600, 
  checkperiod: 600,
  useClones: false
});

function generateCacheKey(prompt, style, colors) {
  const colorKey = colors && colors.length > 0 ? colors.sort().join('-') : 'nocolor';
  return `${prompt.toLowerCase().trim()}-${style}-${colorKey}`;
}

function getCachedIcons(prompt, style, colors) {
  const key = generateCacheKey(prompt, style, colors);
  const cached = cache.get(key);
  
  if (cached) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }
  
  console.log(`Cache miss for key: ${key}`);
  return null;
}

function cacheIcons(prompt, style, colors, data) {
  const key = generateCacheKey(prompt, style, colors);
  cache.set(key, data);
  console.log(`Cached icons for key: ${key}`);
}

function getCacheStats() {
  return cache.getStats();
}

function clearCache() {
  cache.flushAll();
  console.log('Cache cleared');
}

module.exports = {
  getCachedIcons,
  cacheIcons,
  getCacheStats,
  clearCache,
};
