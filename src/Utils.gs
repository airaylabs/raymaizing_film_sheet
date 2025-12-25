/**
 * Utils.gs - Helper Functions
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
    episodes: parseInt(sheet.getRange(STORY.EPISODES).getValue()) || 4,
    scenesPerEp: parseInt(sheet.getRange(STORY.SCENES_PER_EP).getValue()) || 5,
    genre: sheet.getRange(STORY.GENRE).getValue() || '',
    style: sheet.getRange(STORY.STYLE).getValue() || '',
    projectName: sheet.getRange(STORY.PROJECT_NAME).getValue() || ''
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
  sheet.getRange(STORY.PROJECT_NAME).setValue(projectName).setFontColor('#000');
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
  const data = sheet.getRange(CHARS.DATA_START_ROW, 1, numRows, 9).getValues();
  
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
      gender: row[3] || '',
      appearance: row[4] || '',
      seed: row[5] || getSeed(name),
      personality: row[6] || '',
      refImage: row[7] || '',
      status: row[8] || 'New'
    });
  }
  
  return chars;
}

/**
 * Write characters to sheet - with validation
 */
function writeCharacters(characters) {
  const sheet = getCharsSheet();
  if (!sheet || !characters || characters.length === 0) return;
  
  // Valid options for dropdowns
  const validRoles = ['Protagonist', 'Antagonist', 'Supporting', 'Minor'];
  const validGenders = ['Male', 'Female', 'Non-binary'];
  
  // Clear existing
  const lastRow = sheet.getLastRow();
  if (lastRow >= CHARS.DATA_START_ROW) {
    sheet.getRange(CHARS.DATA_START_ROW, 1, lastRow - CHARS.DATA_START_ROW + 1, 9).clear();
  }
  
  // Write new
  characters.forEach((char, i) => {
    const row = CHARS.DATA_START_ROW + i;
    const seed = getSeed(char.name);
    
    // Validate role
    let role = char.role || 'Supporting';
    if (!validRoles.includes(role)) {
      // Try to match
      const roleLower = role.toLowerCase();
      if (roleLower.includes('protag')) role = 'Protagonist';
      else if (roleLower.includes('antag')) role = 'Antagonist';
      else if (roleLower.includes('minor')) role = 'Minor';
      else role = 'Supporting';
    }
    
    // Validate gender
    let gender = char.gender || 'Male';
    if (!validGenders.includes(gender)) {
      const genderLower = gender.toLowerCase();
      if (genderLower.includes('female') || genderLower.includes('woman') || genderLower.includes('girl')) {
        gender = 'Female';
      } else if (genderLower.includes('non')) {
        gender = 'Non-binary';
      } else {
        gender = 'Male';
      }
    }
    
    sheet.getRange(row, 1).setValue(char.name || 'Character ' + (i+1));
    sheet.getRange(row, 2).setValue(role);
    sheet.getRange(row, 3).setValue(char.age || '25');
    sheet.getRange(row, 4).setValue(gender);
    sheet.getRange(row, 5).setValue(char.appearance || 'dark hair, brown eyes');
    sheet.getRange(row, 6).setValue(seed);
    sheet.getRange(row, 7).setValue(char.personality || 'determined');
    sheet.getRange(row, 9).setValue('New');
    
    sheet.setRowHeight(row, 50);
  });
}

/**
 * Write episodes and scenes to Story sheet
 */
function writeEpisodes(episodes) {
  const sheet = getStorySheet();
  if (!sheet || !episodes || episodes.length === 0) return;
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow >= STORY.DATA_START_ROW) {
    sheet.getRange(STORY.DATA_START_ROW, 1, lastRow - STORY.DATA_START_ROW + 1, 9).clear();
  }
  
  let currentRow = STORY.DATA_START_ROW;
  
  episodes.forEach(ep => {
    // Episode row
    sheet.getRange(currentRow, 1).setValue(ep.number);
    sheet.getRange(currentRow, 2).setValue('EPISODE');
    sheet.getRange(currentRow, 3).setValue(ep.title || 'Episode ' + ep.number);
    sheet.getRange(currentRow, 9).setValue('Draft');
    
    sheet.getRange(currentRow, 1, 1, 9)
      .setFontWeight('bold')
      .setBackground('#bbdefb');
    
    if (ep.summary) {
      sheet.getRange(currentRow, 3).setNote(ep.summary);
    }
    
    currentRow++;
    
    // Scenes
    if (ep.scenes && ep.scenes.length > 0) {
      ep.scenes.forEach((scene, si) => {
        const sceneNum = ep.number + '.' + (si + 1);
        
        // Scene header
        sheet.getRange(currentRow, 1).setValue(sceneNum);
        sheet.getRange(currentRow, 2).setValue('SCENE');
        sheet.getRange(currentRow, 3).setValue(scene.title || scene.description || '');
        sheet.getRange(currentRow, 4).setValue(scene.location || '');
        sheet.getRange(currentRow, 5).setValue(scene.timeOfDay || 'Day');
        sheet.getRange(currentRow, 6).setValue(
          Array.isArray(scene.characters) ? scene.characters.join(', ') : ''
        );
        sheet.getRange(currentRow, 7).setValue(scene.costumeNote || '');
        sheet.getRange(currentRow, 9).setValue('Draft');
        
        sheet.getRange(currentRow, 1, 1, 9)
          .setFontWeight('bold')
          .setBackground('#e3f2fd');
        
        currentRow++;
        
        // 4 Acts
        const acts = scene.acts || [
          { act: 'A', description: 'Setup', shotType: 'Wide' },
          { act: 'B', description: 'Development', shotType: 'Medium' },
          { act: 'C', description: 'Climax', shotType: 'Close-up' },
          { act: 'D', description: 'Resolution', shotType: 'Medium' }
        ];
        
        const actColors = [COLORS.ACT_A, COLORS.ACT_B, COLORS.ACT_C, COLORS.ACT_D];
        
        acts.forEach((act, ai) => {
          const actLetter = act.act || ['A','B','C','D'][ai];
          
          sheet.getRange(currentRow, 1).setValue(sceneNum + '.' + actLetter);
          sheet.getRange(currentRow, 2).setValue('Act ' + actLetter);
          sheet.getRange(currentRow, 3).setValue(act.description || '');
          sheet.getRange(currentRow, 4).setValue(act.location || scene.location || '');
          sheet.getRange(currentRow, 5).setValue(act.timeOfDay || scene.timeOfDay || 'Day');
          sheet.getRange(currentRow, 6).setValue(
            Array.isArray(act.characters) ? act.characters.join(', ') : 
            (Array.isArray(scene.characters) ? scene.characters.join(', ') : '')
          );
          sheet.getRange(currentRow, 7).setValue(act.costumeNote || scene.costumeNote || '');
          sheet.getRange(currentRow, 8).setValue(act.shotType || 'Medium');
          sheet.getRange(currentRow, 9).setValue('Draft');
          
          sheet.getRange(currentRow, 1, 1, 9).setBackground(actColors[ai]);
          
          currentRow++;
        });
      });
    }
  });
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
  const data = sheet.getRange(STORY.DATA_START_ROW, 1, numRows, 9).getValues();
  
  const scenes = [];
  let currentScene = null;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const type = row[1];
    
    if (type === 'SCENE') {
      currentScene = {
        row: STORY.DATA_START_ROW + i,
        number: row[0],
        description: row[2] || '',
        location: row[3] || '',
        timeOfDay: row[4] || 'Day',
        characters: row[5] ? row[5].toString().split(',').map(s => s.trim()) : [],
        costumeNote: row[6] || '',
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
        location: row[3] || '',
        timeOfDay: row[4] || 'Day',
        characters: row[5] ? row[5].toString().split(',').map(s => s.trim()) : [],
        costumeNote: row[6] || '',
        shotType: row[7] || 'Medium'
      });
    }
  }
  
  return scenes;
}

/**
 * Add asset to Assets sheet - with full prompt support
 */
function addAsset(asset) {
  const sheet = getAssetsSheet();
  if (!sheet) return -1;
  
  const lastRow = Math.max(sheet.getLastRow(), ASSETS.DATA_START_ROW - 1);
  const newRow = lastRow + 1;
  const id = asset.id || 'A' + String(newRow - ASSETS.DATA_START_ROW + 1).padStart(3, '0');
  
  sheet.getRange(newRow, ASSETS.COL.ID).setValue(id);
  sheet.getRange(newRow, ASSETS.COL.SCENE).setValue(asset.scene || '');
  sheet.getRange(newRow, ASSETS.COL.ACT).setValue(asset.act || 'A');
  sheet.getRange(newRow, ASSETS.COL.DESCRIPTION).setValue(asset.description || '');
  
  // Image Prompt - IMPORTANT!
  if (asset.imagePrompt) {
    sheet.getRange(newRow, ASSETS.COL.IMAGE_PROMPT).setValue(asset.imagePrompt);
  }
  
  // Video Prompt - IMPORTANT!
  if (asset.videoPrompt) {
    sheet.getRange(newRow, ASSETS.COL.VIDEO_PROMPT).setValue(asset.videoPrompt);
  }
  
  sheet.getRange(newRow, ASSETS.COL.STATUS).setValue(asset.status || 'Pending');
  sheet.getRange(newRow, ASSETS.COL.DURATION).setValue(asset.duration || '8s');
  
  // Preview image
  if (asset.imageUrl) {
    sheet.getRange(newRow, ASSETS.COL.IMAGE_URL).setValue(asset.imageUrl);
    try {
      sheet.getRange(newRow, ASSETS.COL.PREVIEW).setFormula('=IMAGE("' + asset.imageUrl + '",1)');
    } catch (e) {
      Logger.log('Preview formula error: ' + e.message);
    }
    sheet.getRange(newRow, ASSETS.COL.STATUS).setValue('Generated');
    sheet.setRowHeight(newRow, 80);
  }
  
  // Set row height for better readability of prompts
  if (!asset.imageUrl) {
    sheet.setRowHeight(newRow, 60);
  }
  
  return newRow;
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

