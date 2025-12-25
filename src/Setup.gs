/**
 * Setup.gs - Template Setup and Reset Functions
 * Creates and resets all worksheets
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
  
  // Delete Sheet1 after creating others
  if (sheet1) {
    try { ss.deleteSheet(sheet1); } catch(e) {}
  }
  
  // Activate Story sheet
  ss.setActiveSheet(ss.getSheetByName(SHEETS.STORY));
  
  SpreadsheetApp.getUi().alert(
    '✅ Template Ready!\n\n' +
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
  
  // Reset Story sheet
  resetStorySheet(ss);
  
  // Reset Characters sheet
  resetCharactersSheet(ss);
  
  // Reset Assets sheet
  resetAssetsSheet(ss);
  
  ui.alert('✅ Template sudah direset!\n\nSiap untuk project baru.');
}

/**
 * Create Story sheet
 */
function createStorySheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.STORY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.STORY);
  }
  sheet.clear();
  sheet.setTabColor('#4285f4');
  
  // Column widths
  sheet.setColumnWidth(1, 70);   // #
  sheet.setColumnWidth(2, 80);   // Type
  sheet.setColumnWidth(3, 280);  // Title/Description
  sheet.setColumnWidth(4, 140);  // Location
  sheet.setColumnWidth(5, 90);   // Time
  sheet.setColumnWidth(6, 140);  // Characters
  sheet.setColumnWidth(7, 120);  // Costume Note
  sheet.setColumnWidth(8, 90);   // Shot
  sheet.setColumnWidth(9, 80);   // Status
  
  // Row 1: Header
  sheet.getRange('A1:I1').merge()
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
  sheet.getRange('B3').setValue('4');
  
  sheet.getRange('C3').setValue('Scenes/Ep:').setFontWeight('bold');
  sheet.getRange('D3').setBackground(COLORS.REQUIRED);
  setDropdown(sheet.getRange('D3'), OPTIONS.scenes);
  sheet.getRange('D3').setValue('5');
  
  // Row 4: Auto-detected (read-only)
  sheet.getRange('A4').setValue('Genre:').setFontWeight('bold');
  sheet.getRange('B4').setValue('(auto)').setFontColor('#999');
  sheet.getRange('C4').setValue('Style:').setFontWeight('bold');
  sheet.getRange('D4').setValue('(auto)').setFontColor('#999');
  sheet.getRange('E4').setValue('Project:').setFontWeight('bold');
  sheet.getRange('F4:I4').merge().setValue('(auto)').setFontColor('#999');
  
  // Row 5: Info
  sheet.getRange('A5:I5').merge()
    .setValue('💡 Genre, Style, Project Name akan auto-detect dari synopsis')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666')
    .setBackground(COLORS.GRAY);
  
  // Row 6: Synopsis header
  sheet.getRange('A6:I6').merge()
    .setValue('📝 SYNOPSIS')
    .setFontSize(12).setFontWeight('bold')
    .setBackground(COLORS.LIGHT_BLUE);
  
  // Row 7-10: Synopsis area
  sheet.getRange('A7:I10').merge()
    .setValue('Tulis synopsis cerita di sini...\n\n' +
      '• Minimal 2-3 paragraf\n' +
      '• Sebutkan nama karakter\n' +
      '• Jelaskan setting & konflik')
    .setFontStyle('italic').setFontColor('#666')
    .setBackground(COLORS.REQUIRED)
    .setWrap(true).setVerticalAlignment('top');
  sheet.setRowHeight(7, 100);
  
  // Row 11: Spacer
  sheet.setRowHeight(11, 10);
  
  // Row 12: Table header
  const headers = ['#', 'Type', 'Title/Description', 'Location', 'Time', 'Characters', 'Costume Note', 'Shot', 'Status'];
  sheet.getRange('A12:I12').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_BLUE);
  
  // Data validation for data rows
  setDropdown(sheet.getRange('E13:E500'), OPTIONS.timeOfDay);
  setDropdown(sheet.getRange('H13:H500'), OPTIONS.shotType);
  setDropdown(sheet.getRange('I13:I500'), OPTIONS.status);
  
  // Freeze rows
  sheet.setFrozenRows(12);
  
  // Conditional formatting for status
  addStatusFormatting(sheet, 'I13:I500');
}

/**
 * Create Characters sheet
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
  sheet.setColumnWidth(2, 100);  // Role
  sheet.setColumnWidth(3, 50);   // Age
  sheet.setColumnWidth(4, 80);   // Gender
  sheet.setColumnWidth(5, 280);  // Appearance
  sheet.setColumnWidth(6, 70);   // Seed
  sheet.setColumnWidth(7, 150);  // Personality
  sheet.setColumnWidth(8, 150);  // Ref Image
  sheet.setColumnWidth(9, 80);   // Status
  
  // Row 1: Header
  sheet.getRange('A1:I1').merge()
    .setValue('👥 CHARACTER DATABASE')
    .setFontSize(20).setFontWeight('bold')
    .setBackground('#34a853').setFontColor('#fff')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Info
  sheet.getRange('A2:I2').merge()
    .setValue('✨ Base Appearance = konsisten di semua scene. Costume variations diatur per scene.')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666');
  
  // Row 3: Table header
  const headers = ['Name', 'Role', 'Age', 'Gender', 'Base Appearance', 'Seed', 'Personality', 'Ref Image', 'Status'];
  sheet.getRange('A3:I3').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_GREEN);
  
  // Data validation
  setDropdown(sheet.getRange('B4:B100'), OPTIONS.role);
  setDropdown(sheet.getRange('D4:D100'), OPTIONS.gender);
  setDropdown(sheet.getRange('I4:I100'), OPTIONS.charStatus);
  
  // Text wrap
  sheet.getRange('E4:E100').setWrap(true);
  sheet.getRange('G4:G100').setWrap(true);
  
  // Freeze rows
  sheet.setFrozenRows(3);
}

/**
 * Create Assets sheet
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
  sheet.setColumnWidth(6, 320);  // Image Prompt
  sheet.setColumnWidth(7, 280);  // Video Prompt
  sheet.setColumnWidth(8, 150);  // Image URL
  sheet.setColumnWidth(9, 80);   // Status
  sheet.setColumnWidth(10, 70);  // Duration
  
  // Row 1: Header
  sheet.getRange('A1:J1').merge()
    .setValue('🎨 GENERATED ASSETS')
    .setFontSize(20).setFontWeight('bold')
    .setBackground('#ea4335').setFontColor('#fff')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  
  // Row 2: Info
  sheet.getRange('A2:J2').merge()
    .setValue('📋 Copy Image Prompt → Midjourney/DALL-E | Copy Video Prompt → VEO/Runway/Pika')
    .setFontSize(10).setFontStyle('italic').setFontColor('#666');
  
  // Row 3: Table header
  const headers = ['ID', 'Scene', 'Act', 'Description', 'Preview', 'Image Prompt', 'Video Prompt', 'Image URL', 'Status', 'Duration'];
  sheet.getRange('A3:J3').setValues([headers])
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setBackground(COLORS.LIGHT_ORANGE);
  
  // Data validation
  setDropdown(sheet.getRange('I4:I500'), OPTIONS.assetStatus);
  
  // Text wrap
  sheet.getRange('D4:D500').setWrap(true);
  sheet.getRange('F4:F500').setWrap(true).setFontSize(9);
  sheet.getRange('G4:G500').setWrap(true).setFontSize(9);
  
  // Freeze rows
  sheet.setFrozenRows(3);
}

/**
 * Reset Story sheet data only
 */
function resetStorySheet(ss) {
  const sheet = ss.getSheetByName(SHEETS.STORY);
  if (!sheet) return;
  
  // Reset settings to defaults
  sheet.getRange(STORY.CONTENT_TYPE).setValue('Drama Series');
  sheet.getRange(STORY.EPISODES).setValue('4');
  sheet.getRange(STORY.SCENES_PER_EP).setValue('5');
  
  // Clear auto-detected
  sheet.getRange(STORY.GENRE).setValue('(auto)').setFontColor('#999');
  sheet.getRange(STORY.STYLE).setValue('(auto)').setFontColor('#999');
  sheet.getRange(STORY.PROJECT_NAME).setValue('(auto)').setFontColor('#999');
  
  // Reset synopsis
  sheet.getRange('A7:I10').setValue(
    'Tulis synopsis cerita di sini...\n\n' +
    '• Minimal 2-3 paragraf\n' +
    '• Sebutkan nama karakter\n' +
    '• Jelaskan setting & konflik'
  ).setFontStyle('italic').setFontColor('#666');
  
  // Clear data rows
  const lastRow = sheet.getLastRow();
  if (lastRow >= STORY.DATA_START_ROW) {
    sheet.getRange(STORY.DATA_START_ROW, 1, lastRow - STORY.DATA_START_ROW + 1, 9).clear();
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
    sheet.getRange(CHARS.DATA_START_ROW, 1, lastRow - CHARS.DATA_START_ROW + 1, 9).clear();
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
    sheet.getRange(ASSETS.DATA_START_ROW, 1, lastRow - ASSETS.DATA_START_ROW + 1, 10).clear();
  }
}

/**
 * Helper: Set dropdown validation
 */
function setDropdown(range, options) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(false)
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
    .whenTextEqualTo('In Progress').setBackground('#e3f2fd').setRanges([r]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Generated').setBackground('#e1bee7').setRanges([r]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Done').setBackground('#c8e6c9').setRanges([r]).build());
  
  sheet.setConditionalFormatRules(rules);
}

/**
 * onEdit trigger - handle Content Type change
 */
function onEdit(e) {
  if (!e || !e.range) return;
  
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEETS.STORY) return;
  
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Content Type changed (B2)
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

