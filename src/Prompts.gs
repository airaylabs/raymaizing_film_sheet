/**
 * Prompts.gs - Prompt Building for AI Image/Video Generation
 * Creates detailed prompts for Midjourney, DALL-E, VEO, Runway, etc.
 */

// Visual style keywords
const STYLES = {
  'Cinematic': 'cinematic lighting, film grain, shallow depth of field, 35mm film, movie quality',
  'Anime': 'anime style, vibrant colors, cel shading, Japanese animation, detailed',
  'Realistic': 'photorealistic, highly detailed, 8K, natural lighting, lifelike',
  'Cartoon': 'cartoon style, bold outlines, bright colors, stylized, animated'
};

// Shot type keywords
const SHOTS = {
  'Wide': 'wide shot, establishing shot, full environment',
  'Medium': 'medium shot, waist up, character focused',
  'Close-up': 'close-up shot, face detail, emotional',
  'Extreme Close-up': 'extreme close-up, macro detail',
  'POV': 'point of view shot, first person',
  'Over-shoulder': 'over the shoulder shot, conversation',
  'Tracking': 'tracking shot, following movement',
  'Aerial': 'aerial shot, birds eye view'
};

// Time of day lighting
const LIGHTING = {
  'Morning': 'morning golden hour, soft warm sunlight',
  'Afternoon': 'bright afternoon daylight, natural lighting',
  'Evening': 'warm sunset lighting, orange tones, golden hour',
  'Night': 'night scene, dramatic shadows, moonlight',
  'Dawn': 'soft dawn light, blue hour, misty',
  'Dusk': 'twilight lighting, purple tones, mysterious'
};

// Camera movements for video
const CAMERAS = {
  'A': 'camera slowly pushes in',
  'B': 'tracking shot, follows action',
  'C': 'static camera, holds on moment',
  'D': 'camera slowly pulls out'
};

/**
 * Build image prompt for an act
 */
function buildImagePrompt(act, scene, characters, style) {
  const parts = [];
  
  // Shot type
  const shot = act.shotType || 'Medium';
  if (SHOTS[shot]) {
    parts.push(SHOTS[shot].split(',')[0]);
  }
  
  // Characters with appearance
  const actChars = act.characters || scene.characters || [];
  if (actChars.length > 0) {
    const charDescs = [];
    
    actChars.forEach(name => {
      const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (char) {
        let desc = char.name;
        if (char.appearance) desc += ' (' + char.appearance + ')';
        
        const costume = act.costumeNote || scene.costumeNote;
        if (costume) desc += ', wearing ' + costume;
        
        if (char.seed) desc += ' [seed:' + char.seed + ']';
        
        charDescs.push(desc);
      } else {
        charDescs.push(name);
      }
    });
    
    if (charDescs.length > 0) {
      parts.push('featuring ' + charDescs.join(' and '));
    }
  }
  
  // Location
  const location = act.location || scene.location;
  if (location) parts.push('in ' + location);
  
  // Action
  if (act.description) parts.push(act.description);
  
  // Lighting
  const time = act.timeOfDay || scene.timeOfDay || 'Day';
  if (LIGHTING[time]) parts.push(LIGHTING[time]);
  
  // Style
  if (style && STYLES[style]) parts.push(STYLES[style]);
  
  return parts.join('. ') + '.';
}

/**
 * Build video prompt for an act
 */
function buildVideoPrompt(act, scene, characters, duration) {
  const parts = [];
  
  // Shot
  const shot = act.shotType || 'Medium';
  parts.push(shot + ' shot');
  
  // Characters (shorter for video)
  const actChars = act.characters || scene.characters || [];
  if (actChars.length > 0) {
    parts.push('of ' + actChars.slice(0, 2).join(' and '));
  }
  
  // Location
  const location = act.location || scene.location;
  if (location) parts.push('in ' + location);
  
  // Action
  if (act.description) parts.push(act.description);
  
  // Lighting
  const time = act.timeOfDay || scene.timeOfDay || 'Day';
  parts.push(time.toLowerCase() + ' lighting');
  
  // Camera movement
  const actLetter = act.act || 'A';
  if (CAMERAS[actLetter]) parts.push('Camera: ' + CAMERAS[actLetter]);
  
  // Duration
  parts.push('Duration: ' + (duration || 8) + ' seconds');
  
  // Quality
  parts.push('Cinematic quality, smooth motion');
  
  return parts.join('. ') + '.';
}

/**
 * Build character reference prompt
 */
function buildCharRefPrompt(char, style) {
  const parts = [];
  
  parts.push('Full body character reference sheet, T-pose, front view');
  
  if (char.name) parts.push(char.name);
  if (char.appearance) parts.push(char.appearance);
  if (char.seed) parts.push('[seed:' + char.seed + ']');
  
  parts.push('white background, character design sheet, full body visible');
  
  if (style && STYLES[style]) {
    const simple = style === 'Anime' ? 'anime style' : 
                   style === 'Cartoon' ? 'cartoon style' : 'detailed';
    parts.push(simple);
  }
  
  return parts.join('. ') + '.';
}

/**
 * Generate storyboard assets for all scenes
 */
function generateStoryboard() {
  const scenes = getScenes();
  
  if (scenes.length === 0) {
    alert('❌ No scenes found.\n\nGenerate episodes first.');
    return;
  }
  
  const characters = getCharacters();
  const settings = getSettings();
  const style = settings.style || 'Cinematic';
  
  // Count acts
  let totalActs = 0;
  scenes.forEach(s => {
    totalActs += (s.acts && s.acts.length) || 4;
  });
  
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '🎨 Generate Storyboard',
    'Will create assets for:\n' +
    '• ' + scenes.length + ' scenes\n' +
    '• ' + totalActs + ' acts\n\n' +
    'Each act gets:\n' +
    '• Preview image\n' +
    '• Image Prompt\n' +
    '• Video Prompt\n\n' +
    'Time: ~' + Math.ceil(totalActs / 10) + ' minutes. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  let success = 0;
  let errors = 0;
  let actNum = 0;
  
  toast('🔄 Generating ' + totalActs + ' assets...', '🎬 Storyboard', 300);
  
  scenes.forEach(scene => {
    const acts = scene.acts || [
      { act: 'A', description: 'Setup', shotType: 'Wide' },
      { act: 'B', description: 'Development', shotType: 'Medium' },
      { act: 'C', description: 'Climax', shotType: 'Close-up' },
      { act: 'D', description: 'Resolution', shotType: 'Medium' }
    ];
    
    acts.forEach((act, ai) => {
      actNum++;
      
      try {
        toast('🔄 Asset ' + actNum + '/' + totalActs + '...', '🎬 Storyboard', 30);
        
        const actLetter = act.act || ['A','B','C','D'][ai];
        
        // Build prompts
        const imagePrompt = buildImagePrompt(act, scene, characters, style);
        const videoPrompt = buildVideoPrompt(act, scene, characters, 8);
        
        // Get seed from main character
        const mainChar = characters.find(c => 
          scene.characters && scene.characters.includes(c.name)
        );
        const seed = mainChar ? mainChar.seed : getSeed(scene.number.toString());
        
        // Generate image URL
        const imageUrl = generateImage(imagePrompt, {
          width: 1280,
          height: 720,
          seed: seed
        });
        
        // Add to sheet
        addAsset({
          scene: scene.number,
          act: actLetter,
          description: act.description || '',
          imagePrompt: imagePrompt,
          videoPrompt: videoPrompt,
          imageUrl: imageUrl,
          duration: '8s'
        });
        
        success++;
        
        // Rate limit
        if (actNum < totalActs) {
          Utilities.sleep(1500);
        }
        
      } catch (e) {
        errors++;
        Logger.log('Asset error: ' + e.message);
      }
    });
  });
  
  alert('✅ Storyboard Complete!\n\n' +
    success + ' assets created\n' +
    errors + ' errors\n\n' +
    'Go to 🎨 Assets sheet to view.');
}

/**
 * Generate character reference image
 */
function generateCharRef() {
  const sheet = getCharsSheet();
  if (!sheet) {
    alert('❌ Characters sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < CHARS.DATA_START_ROW) {
    alert('❌ Select a character row first.');
    return;
  }
  
  const characters = getCharacters();
  const char = characters.find(c => c.row === row);
  
  if (!char) {
    alert('❌ Character not found.');
    return;
  }
  
  const settings = getSettings();
  const style = settings.style || 'Cinematic';
  
  toast('🔄 Generating reference for ' + char.name + '...', '🎬', 30);
  
  const prompt = buildCharRefPrompt(char, style);
  const imageUrl = generateImage(prompt, {
    width: 1024,
    height: 1024,
    seed: char.seed
  });
  
  sheet.getRange(row, CHARS.COL.REF_IMAGE).setValue(imageUrl);
  sheet.getRange(row, CHARS.COL.STATUS).setValue('Has Reference');
  
  alert('✅ Reference generated for ' + char.name + '!');
}

/**
 * Generate all character references
 */
function generateAllCharRefs() {
  const characters = getCharacters();
  
  if (characters.length === 0) {
    alert('❌ No characters found.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '👥 Generate All References',
    'Generate reference images for ' + characters.length + ' characters?\n\n' +
    'This ensures consistent appearance.',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  const settings = getSettings();
  const style = settings.style || 'Cinematic';
  const sheet = getCharsSheet();
  
  let success = 0;
  
  characters.forEach((char, i) => {
    toast('🔄 Character ' + (i+1) + '/' + characters.length + ': ' + char.name, '🎬', 30);
    
    try {
      const prompt = buildCharRefPrompt(char, style);
      const imageUrl = generateImage(prompt, {
        width: 1024,
        height: 1024,
        seed: char.seed
      });
      
      sheet.getRange(char.row, CHARS.COL.REF_IMAGE).setValue(imageUrl);
      sheet.getRange(char.row, CHARS.COL.STATUS).setValue('Has Reference');
      
      success++;
      
      if (i < characters.length - 1) {
        Utilities.sleep(1500);
      }
    } catch (e) {
      Logger.log('Char ref error: ' + e.message);
    }
  });
  
  alert('✅ Generated ' + success + '/' + characters.length + ' references!');
}

