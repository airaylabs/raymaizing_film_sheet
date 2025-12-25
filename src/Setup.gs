/**
 * Setup.gs - Template Setup and Reset Functions V7
 * Creates and resets all worksheets
 * UPDATED: Added prompt columns, overview sheet, better dropdowns
 */

/**
 * Main setup - creates all sheets from scratch
 */
function setupTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Remove default sheet if exists
  const sheet1 = ss.getSheetByName('Sheet1');
  
  // Create all sheets
  createStorySheet(ss);
  createCharactersSheet(ss);
  createAssetsSheet(ss);
  createOverviewSheet(ss);
  
  // Delete Sheet1 after creating others
  if (sheet1) {
    try { ss.deleteSheet(sheet1); } catch(e) {}
  }
  
  // Activate Story sheet
  ss.setActiveSheet(ss.getSheetByName(SHEETS.STORY));
  
  SpreadsheetApp.getUi().alert(
    '✅ Template Siap!\n\n' +
    '1. Pilih Content Type\n' +
    '2. Tulis Synopsis\n' +
    '3. Klik 🎬 AI Film → 🚀 Generate All\n\n' +
    'Refresh (F5) untuk melihat menu.'
  );
}

/**
 * Reset template - clears all data but keeps structure
 */
function resetTemplate() {
  const ui = SpreadsheetApp.getUi();
  
  const confirm = ui.alert(
    '🔄 Reset Template',
    'Ini akan menghapus SEMUA data:\n' +
    '• Synopsis\n' +
    '• Characters\n' +
    '• Episodes & Scenes\n' +
    '• Assets\n\n' +
    'Data tidak bisa dikembalikan. Lanjutkan?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  resetStorySheet(ss);
  resetCharactersSheet(ss);
  resetAssetsSheet(ss);
  
  ui.alert('✅ Template sudah direset!\n\nSiap untuk project baru.');
}

/**
 * Create Story sheet - UPDATED with prompt columns
 */
function createStorySheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.STORY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.STORY);
  }
  sheet.clear();
  sheet.setTabColor('#4285f4');
  
  // Column widths - UPDATED
  sheet.setColumnWidth(1, 60);   // A - #
  sheet.setColumnWidth(2, 70);   // B - Type
  sheet.setColumnWidth(3, 300);  // C - Title/Description (wider for content)
  sheet.setColumnWidth(4, 120);  // D - Location (shorter)
  sheet.setColumnWidth(5, 70);   // E - Time
  sheet.setColumnWidth(6, 100);  // F - Characters (dropdown)
  sheet.setColumnWidth(7, 100);  // G - Costume (shorter)
  sheet.setColumnWidth(8, 80);   // H - Shot
  sheet.setColumnWidth(9, 70);   // I - Status
  sheet.setColumnWidth(10, 350); // J - Image Prompt (NEW)
  sheet.setColumnWidth(11, 300); // K - Video Prompt (NEW)
  sheet.setColumnWidth(12, 200); // L - Narration/Dialog (NEW)
  
  // Row 1: Header
  sheet.getRange('A1:L1').merge()
    .setValue('🎬 AI FILMMAKING STUDIO')
    .setFontSize(20).setFontWeight('bold')
    .setBackground(COLORS.HEADER).setFontColor(COLORS.HEADER_TEXT)
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Content Type
  sheet.getRange('A2').setValue('Content Type:').setFontWeight('bold');
  sheet.getRange('B2').setBackground(COLORS.REQUIRED);
  setDropdown(sheet.getRange('B2'), OPTIONS.contentType);
  sheet.getRange('B2').setValue('Drama Series');
  
  // Row 3: Episodes & Scenes
  sheet.getRange('A3').setValue('Episodes:').setFontWeight('bold');
  sheet.getRange('B3').setBackground(COLORS.REQUIRED);
  setDropdown(sheet.getRange('B3'), OPTIONS.episodes);
  sheet.getRange('B3').setValue('2');
  
  sheet.getRange('C3').setValue('Scenes/Ep:').setFontWeight('bold');
  sheet.getRange('D3').setBackground(COLORS.REQUIRED);
  setDropdown(sheet.getRange('D3'), OPTIONS.scenes);
  sheet.getRange('D3').setValue('3');
  
  // Row 4: Auto-detected
  sheet.getRange('A4').setValue('Genre:').setFontWeight('bold');
  sheet.getRange('B4').setValue('(auto)').setFontColor('#999');
  sheet.getRange('C4').setValue('Style:').setFontWeight('bold');
  sheet.getRange('D4').setValue('(auto)').setFontColor('#999');
  sheet.getRange('E4').setValue('Project:').setFontWeight('bold');
  sheet.getRange('F4:H4').merge().setValue('(auto)').setFontColor('#999');
  
  // Row 5: Info
  sheet.getRange('A5:L5').merge()
    .setValue('💡 Kolom J-L berisi PROMPT yang bisa di-copy ke AI tools (Midjourney, DALL-E, Runway, dll)')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666')
    .setBackground(COLORS.GRAY);
  
  // Row 6: Synopsis header
  sheet.getRange('A6:L6').merge()
    .setValue('📝 SYNOPSIS')
    .setFontSize(12).setFontWeight('bold')
    .setBackground(COLORS.LIGHT_BLUE);
  
  // Row 7-10: Synopsis area
  sheet.getRange('A7:L10').merge()
    .setValue('Tulis synopsis cerita di sini dalam Bahasa Indonesia...\n\n' +
      '• Minimal 2-3 paragraf\n' +
      '• Sebutkan nama karakter (contoh: Ahmad, Siti, Kyai Hasan)\n' +
      '• Jelaskan setting, konflik, dan ending')
    .setFontStyle('italic').setFontColor('#666')
    .setBackground(COLORS.REQUIRED)
    .setWrap(true).setVerticalAlignment('top');
  sheet.setRowHeight(7, 100);
  
  // Row 11: Spacer
  sheet.setRowHeight(11, 10);
  
  // Row 12: Table header - UPDATED
  const headers = [
    '#', 'Type', 'Title/Description', 'Location', 'Time', 
    'Characters', 'Costume', 'Shot', 'Status',
    '🖼️ Image Prompt', '🎬 Video Prompt', '💬 Narration'
  ];
  sheet.getRange('A12:L12').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_BLUE);
  
  // Data validation for data rows - FIXED: Allow invalid to prevent errors
  setDropdownAllowInvalid(sheet.getRange('E13:E500'), OPTIONS.timeOfDay);
  setDropdownAllowInvalid(sheet.getRange('H13:H500'), OPTIONS.shotType);
  setDropdownAllowInvalid(sheet.getRange('I13:I500'), OPTIONS.status);
  
  // Text wrap for content columns
  sheet.getRange('C13:C500').setWrap(true);
  sheet.getRange('J13:J500').setWrap(true).setFontSize(9);
  sheet.getRange('K13:K500').setWrap(true).setFontSize(9);
  sheet.getRange('L13:L500').setWrap(true);
  
  // Freeze rows
  sheet.setFrozenRows(12);
  
  // Conditional formatting for status
  addStatusFormatting(sheet, 'I13:I500');
}

/**
 * Create Characters sheet - UPDATED
 */
function createCharactersSheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.CHARACTERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.CHARACTERS);
  }
  sheet.clear();
  sheet.setTabColor('#34a853');
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Name
  sheet.setColumnWidth(2, 90);   // Role
  sheet.setColumnWidth(3, 50);   // Age
  sheet.setColumnWidth(4, 70);   // Gender
  sheet.setColumnWidth(5, 300);  // Appearance
  sheet.setColumnWidth(6, 70);   // Seed
  sheet.setColumnWidth(7, 150);  // Personality
  sheet.setColumnWidth(8, 150);  // Ref Image
  sheet.setColumnWidth(9, 80);   // Status
  sheet.setColumnWidth(10, 400); // Character Prompt (NEW)
  
  // Row 1: Header
  sheet.getRange('A1:J1').merge()
    .setValue('👥 CHARACTER DATABASE')
    .setFontSize(20).setFontWeight('bold')
    .setBackground('#34a853').setFontColor('#fff')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Info
  sheet.getRange('A2:J2').merge()
    .setValue('✨ Kolom J berisi PROMPT untuk generate karakter yang konsisten. Copy ke Midjourney/DALL-E.')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666');
  
  // Row 3: Table header
  const headers = ['Name', 'Role', 'Age', 'Gender', 'Base Appearance', 'Seed', 'Personality', 'Ref Image', 'Status', '🖼️ Character Prompt'];
  sheet.getRange('A3:J3').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_GREEN);
  
  // Data validation - Allow invalid to prevent errors
  setDropdownAllowInvalid(sheet.getRange('B4:B100'), OPTIONS.role);
  setDropdownAllowInvalid(sheet.getRange('D4:D100'), OPTIONS.gender);
  setDropdownAllowInvalid(sheet.getRange('I4:I100'), OPTIONS.charStatus);
  
  // Text wrap
  sheet.getRange('E4:E100').setWrap(true);
  sheet.getRange('G4:G100').setWrap(true);
  sheet.getRange('J4:J100').setWrap(true).setFontSize(9);
  
  // Freeze rows
  sheet.setFrozenRows(3);
}

/**
 * Create Assets sheet - UPDATED with 3 prompt types
 */
function createAssetsSheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.ASSETS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.ASSETS);
  }
  sheet.clear();
  sheet.setTabColor('#ea4335');
  
  // Column widths
  sheet.setColumnWidth(1, 50);   // ID
  sheet.setColumnWidth(2, 60);   // Scene
  sheet.setColumnWidth(3, 50);   // Act
  sheet.setColumnWidth(4, 180);  // Description
  sheet.setColumnWidth(5, 100);  // Preview
  sheet.setColumnWidth(6, 350);  // Text-to-Image Prompt
  sheet.setColumnWidth(7, 300);  // Image-to-Image Prompt
  sheet.setColumnWidth(8, 300);  // Image-to-Video Prompt
  sheet.setColumnWidth(9, 150);  // Image URL
  sheet.setColumnWidth(10, 80);  // Status
  sheet.setColumnWidth(11, 70);  // Duration
  
  // Row 1: Header
  sheet.getRange('A1:K1').merge()
    .setValue('🎨 GENERATED ASSETS')
    .setFontSize(20).setFontWeight('bold')
    .setBackground('#ea4335').setFontColor('#fff')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Info
  sheet.getRange('A2:K2').merge()
    .setValue('📋 Text2Img → Midjourney/DALL-E/Dreamina | Img2Img → Whisk/Photoshop | Img2Vid → Runway/Pika/Hailuo/VEO')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666');
  
  // Row 3: Table header - UPDATED
  const headers = [
    'ID', 'Scene', 'Act', 'Description', 'Preview', 
    '🖼️ Text-to-Image', '🔄 Image-to-Image', '🎬 Image-to-Video',
    'Image URL', 'Status', 'Duration'
  ];
  sheet.getRange('A3:K3').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_ORANGE);
  
  // Data validation
  setDropdownAllowInvalid(sheet.getRange('J4:J500'), OPTIONS.assetStatus);
  
  // Text wrap for prompt columns
  sheet.getRange('D4:D500').setWrap(true);
  sheet.getRange('F4:F500').setWrap(true).setFontSize(9);
  sheet.getRange('G4:G500').setWrap(true).setFontSize(9);
  sheet.getRange('H4:H500').setWrap(true).setFontSize(9);
  
  // Freeze rows
  sheet.setFrozenRows(3);
}

/**
 * Create Overview sheet - NEW
 */
function createOverviewSheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.OVERVIEW);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.OVERVIEW);
  }
  sheet.clear();
  sheet.setTabColor('#9c27b0');
  
  // Column widths
  sheet.setColumnWidth(1, 100);  // Type
  sheet.setColumnWidth(2, 80);   // #
  sheet.setColumnWidth(3, 300);  // Title
  sheet.setColumnWidth(4, 400);  // Summary/Description
  sheet.setColumnWidth(5, 100);  // Status
  
  // Row 1: Header
  sheet.getRange('A1:E1').merge()
    .setValue('📊 STORY OVERVIEW')
    .setFontSize(20).setFontWeight('bold')
    .setBackground('#9c27b0').setFontColor('#fff')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Info
  sheet.getRange('A2:E2').merge()
    .setValue('📋 Ringkasan cerita - Episode, Scene, dan Act dalam satu tampilan')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666');
  
  // Row 3: Stats (will be filled by formula)
  sheet.getRange('A3').setValue('📺 Episodes:').setFontWeight('bold');
  sheet.getRange('B3').setFormula('=COUNTIF(\'🎬 Story\'!B:B,"EPISODE")');
  sheet.getRange('C3').setValue('🎬 Scenes:').setFontWeight('bold');
  sheet.getRange('D3').setFormula('=COUNTIF(\'🎬 Story\'!B:B,"SCENE")');
  
  // Row 4: More stats
  sheet.getRange('A4').setValue('🎭 Acts:').setFontWeight('bold');
  sheet.getRange('B4').setFormula('=COUNTIF(\'🎬 Story\'!B:B,"Act*")');
  sheet.getRange('C4').setValue('👥 Characters:').setFontWeight('bold');
  sheet.getRange('D4').setFormula('=COUNTA(\'👥 Characters\'!A4:A100)');
  
  // Row 5: Spacer
  sheet.setRowHeight(5, 10);
  
  // Row 6: Table header
  const headers = ['Type', '#', 'Title', 'Summary/Description', 'Status'];
  sheet.getRange('A6:E6').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_PURPLE);
  
  // Freeze rows
  sheet.setFrozenRows(6);
  
  // Text wrap
  sheet.getRange('C7:D500').setWrap(true);
}

/**
 * Reset Story sheet data only
 */
function resetStorySheet(ss) {
  const sheet = ss.getSheetByName(SHEETS.STORY);
  if (!sheet) return;
  
  // Reset settings to defaults
  sheet.getRange(STORY.CONTENT_TYPE).setValue('Drama Series');
  sheet.getRange(STORY.EPISODES).setValue('2');
  sheet.getRange(STORY.SCENES_PER_EP).setValue('3');
  
  // Clear auto-detected
  sheet.getRange(STORY.GENRE).setValue('(auto)').setFontColor('#999');
  sheet.getRange(STORY.STYLE).setValue('(auto)').setFontColor('#999');
  sheet.getRange('F4:H4').merge().setValue('(auto)').setFontColor('#999');
  
  // Reset synopsis
  sheet.getRange('A7:L10').setValue(
    'Tulis synopsis cerita di sini dalam Bahasa Indonesia...\n\n' +
    '• Minimal 2-3 paragraf\n' +
    '• Sebutkan nama karakter (contoh: Ahmad, Siti, Kyai Hasan)\n' +
    '• Jelaskan setting, konflik, dan ending'
  ).setFontStyle('italic').setFontColor('#666');
  
  // Clear data rows
  const lastRow = sheet.getLastRow();
  if (lastRow >= STORY.DATA_START_ROW) {
    sheet.getRange(STORY.DATA_START_ROW, 1, lastRow - STORY.DATA_START_ROW + 1, 12).clear();
  }
}

/**
 * Reset Characters sheet data only
 */
function resetCharactersSheet(ss) {
  const sheet = ss.getSheetByName(SHEETS.CHARACTERS);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow >= CHARS.DATA_START_ROW) {
    sheet.getRange(CHARS.DATA_START_ROW, 1, lastRow - CHARS.DATA_START_ROW + 1, 10).clear();
  }
}

/**
 * Reset Assets sheet data only
 */
function resetAssetsSheet(ss) {
  const sheet = ss.getSheetByName(SHEETS.ASSETS);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow >= ASSETS.DATA_START_ROW) {
    sheet.getRange(ASSETS.DATA_START_ROW, 1, lastRow - ASSETS.DATA_START_ROW + 1, 11).clear();
  }
}

/**
 * Helper: Set dropdown validation - STRICT (no invalid)
 */
function setDropdown(range, options) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(false)
    .build();
  range.setDataValidation(rule);
}

/**
 * Helper: Set dropdown validation - ALLOW INVALID (prevents errors)
 */
function setDropdownAllowInvalid(range, options) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(true)  // IMPORTANT: Allow invalid to prevent H33 error
    .build();
  range.setDataValidation(rule);
}

/**
 * Helper: Add status conditional formatting
 */
function addStatusFormatting(sheet, range) {
  const rules = [];
  const r = sheet.getRange(range);
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Draft').setBackground('#fff9c4').setRanges([r]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Review').setBackground('#e3f2fd').setRanges([r]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Approved').setBackground('#e1bee7').setRanges([r]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Done').setBackground('#c8e6c9').setRanges([r]).build());
  
  sheet.setConditionalFormatRules(rules);
}

/**
 * onEdit trigger - handle Content Type change and auto-update prompts
 */
function onEdit(e) {
  if (!e || !e.range) return;
  
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  
  // Content Type changed (B2) in Story sheet
  if (sheetName === SHEETS.STORY) {
    const row = e.range.getRow();
    const col = e.range.getColumn();
    
    if (row === 2 && col === 2) {
      const contentType = e.value;
      const preset = CONTENT_TYPES[contentType];
      
      if (preset) {
        sheet.getRange('B3').setValue(preset.episodes.toString());
        sheet.getRange('D3').setValue(preset.scenes.toString());
        
        SpreadsheetApp.getActiveSpreadsheet().toast(
          `${contentType}: ${preset.episodes} episodes, ${preset.scenes} scenes/ep`,
          '🎬 Preset Applied', 3
        );
      }
    }
  }
}
