/**
 * API.gs - AI Text & Image Generation
 * Uses multiple methods to ensure reliability
 */

const POLLINATIONS_IMAGE_URL = 'https://image.pollinations.ai/prompt/';

/**
 * Generate text - tries multiple methods
 */
function generateText(prompt) {
  // Method 1: Simple GET with short prompt (most reliable)
  let result = trySimpleGET(prompt);
  if (result.success) return result;
  
  Logger.log('Method 1 failed, trying method 2...');
  
  // Method 2: GET with encoded prompt
  result = tryEncodedGET(prompt);
  if (result.success) return result;
  
  Logger.log('All methods failed');
  return { success: false, data: null, error: 'All API methods failed' };
}

/**
 * Method 1: Simple GET request with very short prompt
 */
function trySimpleGET(prompt) {
  try {
    // Keep prompt very short for URL limit
    let shortPrompt = prompt;
    if (shortPrompt.length > 1500) {
      shortPrompt = shortPrompt.substring(0, 1500);
    }
    
    // Simple URL format
    const url = 'https://text.pollinations.ai/' + encodeURIComponent(shortPrompt);
    
    Logger.log('GET URL length: ' + url.length);
    
    if (url.length > 2000) {
      return { success: false, data: null, error: 'URL too long' };
    }
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    Logger.log('GET Response code: ' + code);
    Logger.log('GET Response length: ' + text.length);
    
    if (code === 200 && text && text.length > 10) {
      Logger.log('GET Response preview: ' + text.substring(0, 150));
      return { success: true, data: text, error: null };
    }
    
    return { success: false, data: null, error: 'HTTP ' + code };
    
  } catch (e) {
    Logger.log('GET Error: ' + e.message);
    return { success: false, data: null, error: e.message };
  }
}

/**
 * Method 2: GET with model parameter
 */
function tryEncodedGET(prompt) {
  try {
    let shortPrompt = prompt;
    if (shortPrompt.length > 1200) {
      shortPrompt = shortPrompt.substring(0, 1200);
    }
    
    const encoded = encodeURIComponent(shortPrompt);
    const url = 'https://text.pollinations.ai/' + encoded + '?model=openai';
    
    Logger.log('Encoded GET URL length: ' + url.length);
    
    if (url.length > 2000) {
      return { success: false, data: null, error: 'URL too long' };
    }
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    Logger.log('Encoded GET code: ' + code);
    
    if (code === 200 && text && text.length > 10) {
      return { success: true, data: text, error: null };
    }
    
    return { success: false, data: null, error: 'HTTP ' + code };
    
  } catch (e) {
    return { success: false, data: null, error: e.message };
  }
}

/**
 * Generate image URL
 */
function generateImage(prompt, options) {
  options = options || {};
  
  const params = {
    width: options.width || 1280,
    height: options.height || 720,
    seed: options.seed || Math.floor(Math.random() * 999999),
    nologo: true,
    model: 'flux'
  };
  
  const queryString = Object.keys(params)
    .map(k => k + '=' + encodeURIComponent(params[k]))
    .join('&');
  
  const shortPrompt = prompt.substring(0, 600);
  const encodedPrompt = encodeURIComponent(shortPrompt);
  
  return POLLINATIONS_IMAGE_URL + encodedPrompt + '?' + queryString;
}

/**
 * Test API connection
 */
function testAPI() {
  const results = {
    text: { ok: false, msg: '' },
    image: { ok: false, msg: '' }
  };
  
  // Test text API
  try {
    Logger.log('Testing Text API...');
    // Very simple test prompt
    const r = generateText('Say hello and return JSON: {"message":"hello"}');
    if (r.success) {
      results.text.ok = true;
      results.text.msg = 'OK: ' + (r.data || '').substring(0, 40);
    } else {
      results.text.msg = 'Error: ' + r.error;
    }
  } catch (e) {
    results.text.msg = 'Exception: ' + e.message;
  }
  
  // Test image API
  try {
    const url = generateImage('test', {});
    if (url && url.includes('pollinations')) {
      results.image.ok = true;
      results.image.msg = 'URL OK';
    }
  } catch (e) {
    results.image.msg = 'Exception: ' + e.message;
  }
  
  return results;
}

/**
 * Parse JSON from text - robust version
 */
function parseJSON(text) {
  if (!text) return null;
  
  let str = text.trim();
  Logger.log('parseJSON length: ' + str.length);
  
  // Direct parse
  try { return JSON.parse(str); } catch (e) {}
  
  // Remove markdown
  str = str.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(str); } catch (e) {}
  
  // Find JSON start
  const firstBrace = str.indexOf('{');
  const firstBracket = str.indexOf('[');
  let start = -1;
  
  if (firstBrace >= 0 && firstBracket >= 0) {
    start = Math.min(firstBrace, firstBracket);
  } else if (firstBrace >= 0) {
    start = firstBrace;
  } else if (firstBracket >= 0) {
    start = firstBracket;
  }
  
  if (start > 0) {
    str = str.substring(start);
    try { return JSON.parse(str); } catch (e) {}
  }
  
  // Extract with brace matching
  try {
    let depth = 0, s = -1, e = -1;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{' || str[i] === '[') {
        if (depth === 0) s = i;
        depth++;
      } else if (str[i] === '}' || str[i] === ']') {
        depth--;
        if (depth === 0 && s >= 0) { e = i + 1; break; }
      }
    }
    if (s >= 0 && e > s) {
      return JSON.parse(str.substring(s, e));
    }
  } catch (e) {}
  
  // Regex fallback
  const obj = str.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch (e) {} }
  
  const arr = str.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch (e) {} }
  
  Logger.log('JSON parse failed');
  return null;
}

