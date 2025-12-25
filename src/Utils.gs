/**
 * Utils.gs - Helper Functions V7
 * Sheet operations and utilities
 */

/**
 * Get sheet by name
 */
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function getStorySheet() { return getSheet(SHEETS.STORY); }
function getCharsSheet() { return getSheet(SHEETS.CHARACTERS); }
function getAssetsSheet() { return getSheet(SHEETS.ASSETS); }

/**
 * Get settings from Story sheet
 */
function getSettings() {
  const sheet = getStorySheet();
  if (!sheet) return null;
  
  return {
    contentType: sheet.getRange(STORY.CONTENT_TYPE).getValue() || 'Drama Series',
    episodes: parseInt(sheet.getRange(STORY.EPISODES).getValue()) || 2,
    scenesPerEp: parseInt(sheet.getRange(STORY.SCENES_PER_EP).getValue()) || 3,
    genre: sheet.getRange(STORY.GENRE).getValue() || '',
    style: sheet.getRange(STORY.STYLE).getValue() || '',
    projectName: sheet.getRange('F4').getValue() || ''
  };
}

/**
 * Get synopsis from Story sheet
 */
function getSynopsis() {
  const sheet = getStorySheet();
  if (!sheet) return '';
  
  const val = sheet.getRange(STORY.SYNOPSIS).getValue();
  return val ? val.toString().trim() : '';
}

/**
 * Set auto-detected values
 */
function setAutoValues(genre, style, projectName) {
  const sheet = getStorySheet();
  if (!sheet) return;
  
  sheet.getRange(STORY.GENRE).setValue(genre).setFontColor('#000');
  sheet.getRange(STORY.STYLE).setValue(style).setFontColor('#000');
  sheet.getRange('F4:H4').merge().setValue(projectName).setFontColor('#000');
}

/**
 * Generate seed from name (for character consistency)
 */
function getSeed(name) {
  if (!name) return Math.floor(Math.random() * 999999);
  
  let hash = 0;
  const str = name.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 999999;
}

/**
 * Get all characters from sheet
 */
function getCharacters() {
  const sheet = getCharsSheet();
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < CHARS.DATA_START_ROW) return [];
  
  const numRows = lastRow - CHARS.DATA_START_ROW + 1;
  const data = sheet.getRange(CHARS.DATA_START_ROW, 1, numRows, 10).getValues();
  
  const chars = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row[0];
    if (!name || name.toString().trim() === '') continue;
    
    chars.push({
      row: CHARS.DATA_START_ROW + i,
      name: name.toString().trim(),
      role: row[1] || 'Supporting',
      age: row[2] || '',
      gender: row[3] || 'Pria',
      appearance: row[4] || '',
      seed: row[5] || getSeed(name),
      personality: row[6] || '',
      refImage: row[7] || '',
      status: row[8] || 'Baru',
      charPrompt: row[9] || ''
    });
  }
  
  return chars;
}

/**
 * Get all scenes from Story sheet
 */
function getScenes() {
  const sheet = getStorySheet();
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < STORY.DATA_START_ROW) return [];
  
  const numRows = lastRow - STORY.DATA_START_ROW + 1;
  const data = sheet.getRange(STORY.DATA_START_ROW, 1, numRows, 12).getValues();
  
  const scenes = [];
  let currentScene = null;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const type = row[1];
    
    if (type === 'SCENE') {
      currentScene = {
        row: STORY.DATA_START_ROW + i,
        number: row[0],
        title: row[2] || '',
        location: row[3] || '',
        time: row[4] || 'Pagi',
        characters: row[5] ? row[5].toString().split(',').map(s => s.trim()) : [],
        costume: row[6] || '',
        acts: []
      };
      scenes.push(currentScene);
    }
    
    if (type && type.toString().startsWith('Act ') && currentScene) {
      currentScene.acts.push({
        row: STORY.DATA_START_ROW + i,
        act: type.replace('Act ', ''),
        number: row[0],
        description: row[2] || '',
        shot: row[7] || 'Medium',
        imgPrompt: row[9] || '',
        vidPrompt: row[10] || '',
        narration: row[11] || ''
      });
    }
  }
  
  return scenes;
}

/**
 * Show toast message
 */
function toast(msg, title, sec) {
  SpreadsheetApp.getActiveSpreadsheet().toast(msg, title || '🎬', sec || 5);
}

/**
 * Show alert dialog
 */
function alert(msg) {
  SpreadsheetApp.getUi().alert(msg);
}

/**
 * Regenerate prompts for selected row
 * Can be called from menu or button
 */
function regeneratePrompts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  if (sheetName !== SHEETS.STORY) {
    alert('❌ Pilih baris di sheet Story terlebih dahulu.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < STORY.DATA_START_ROW) {
    alert('❌ Pilih baris act untuk regenerate prompt.');
    return;
  }
  
  const type = sheet.getRange(row, STORY.COL.TYPE).getValue();
  if (!type || !type.toString().startsWith('Act')) {
    alert('❌ Pilih baris Act (bukan Episode/Scene).');
    return;
  }
  
  toast('🔄 Regenerating prompts...', '🎬', 10);
  
  // Get data from row
  const description = sheet.getRange(row, STORY.COL.TITLE).getValue();
  const location = sheet.getRange(row, STORY.COL.LOCATION).getValue();
  const time = sheet.getRange(row, STORY.COL.TIME).getValue();
  const characters = sheet.getRange(row, STORY.COL.CHARACTERS).getValue();
  const costume = sheet.getRange(row, STORY.COL.COSTUME).getValue();
  const shot = sheet.getRange(row, STORY.COL.SHOT).getValue();
  
  // Get settings
  const settings = getSettings();
  const style = settings.style || 'Cinematic';
  
  // Get character details
  const allChars = getCharacters();
  const charNames = characters ? characters.split(',').map(s => s.trim()) : [];
  
  // Build act object
  const act = {
    act: type.replace('Act ', ''),
    description: description,
    shot: shot
  };
  
  // Build scene object
  const scene = {
    location: location,
    time: time,
    characters: charNames,
    costume: costume
  };
  
  // Build basicInfo
  const basicInfo = {
    style: style,
    setting: location
  };
  
  // Generate new prompts
  const txt2img = buildText2ImagePrompt(act, scene, allChars, basicInfo);
  const img2img = buildImage2ImagePrompt(act, scene, allChars, basicInfo);
  const img2vid = buildImage2VideoPrompt(act, scene, allChars);
  
  // Update cells
  sheet.getRange(row, STORY.COL.IMG_PROMPT).setValue(txt2img);
  sheet.getRange(row, STORY.COL.VID_PROMPT).setValue(img2vid);
  
  toast('✅ Prompts updated!', '🎬', 3);
}

/**
 * Copy prompt to clipboard (shows dialog)
 */
function copyPromptDialog() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  const col = sheet.getActiveRange().getColumn();
  
  const value = sheet.getRange(row, col).getValue();
  
  if (!value) {
    alert('❌ Cell kosong.');
    return;
  }
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial; padding: 20px; }
      textarea { width: 100%; height: 200px; font-size: 12px; }
      button { margin-top: 10px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .tip { font-size: 11px; color: #666; margin-top: 10px; }
    </style>
    <p><b>Copy prompt ini:</b></p>
    <textarea id="prompt" readonly>${value}</textarea>
    <button onclick="copyText()">📋 Copy to Clipboard</button>
    <p class="tip">Paste ke: Midjourney, DALL-E, Runway, Pika, dll.</p>
    <script>
      function copyText() {
        const textarea = document.getElementById('prompt');
        textarea.select();
        document.execCommand('copy');
        alert('Copied!');
      }
    </script>
  `).setWidth(500).setHeight(350);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Copy Prompt');
}

/**
 * Build dropdown from existing data (for Characters column)
 */
function updateCharacterDropdowns() {
  const chars = getCharacters();
  if (chars.length === 0) return;
  
  const charNames = chars.map(c => c.name);
  const storySheet = getStorySheet();
  
  if (storySheet) {
    // Set dropdown for Characters column
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(charNames, true)
      .setAllowInvalid(true)
      .build();
    storySheet.getRange('F13:F500').setDataValidation(rule);
  }
}

/**
 * Build dropdown from existing locations
 */
function updateLocationDropdowns() {
  const scenes = getScenes();
  if (scenes.length === 0) return;
  
  // Get unique locations
  const locations = [...new Set(scenes.map(s => s.location).filter(l => l))];
  if (locations.length === 0) return;
  
  const storySheet = getStorySheet();
  
  if (storySheet) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(locations, true)
      .setAllowInvalid(true)
      .build();
    storySheet.getRange('D13:D500').setDataValidation(rule);
  }
}
