/**
 * Code.gs - Main Entry Point
 * Menu creation and UI functions
 */

/**
 * Creates menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🎬 AI Film')
    // Primary action
    .addItem('🚀 Generate All from Synopsis', 'generateAll')
    .addSeparator()
    
    // Characters
    .addSubMenu(ui.createMenu('👥 Characters')
      .addItem('Generate Character Reference', 'generateCharRef')
      .addItem('Generate All References', 'generateAllCharRefs'))
    
    // Assets
    .addSubMenu(ui.createMenu('🎨 Assets')
      .addItem('Generate Storyboard', 'generateStoryboard')
      .addItem('Copy Image Prompt', 'copyImagePrompt')
      .addItem('Copy Video Prompt', 'copyVideoPrompt')
      .addItem('Export All Prompts', 'exportPrompts'))
    
    .addSeparator()
    
    // Project management
    .addItem('📁 New Project (Reset)', 'resetTemplate')
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('🧪 Test API', 'testApiConnection')
    .addItem('❓ Help', 'showHelp')
    
    .addToUi();
}

/**
 * Test API connection
 */
function testApiConnection() {
  toast('🔄 Testing API...', '🧪 Test', 15);
  
  const results = testAPI();
  
  let msg = '🧪 API Test Results:\n\n';
  msg += 'Text API: ' + (results.text.ok ? '✅' : '❌') + '\n';
  msg += results.text.msg + '\n\n';
  msg += 'Image API: ' + (results.image.ok ? '✅' : '❌') + '\n';
  msg += results.image.msg;
  
  alert(msg);
}

/**
 * Show settings dialog
 */
function showSettings() {
  const settings = getSettings();
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #1a73e8; margin-top: 0; }
      .row { margin-bottom: 12px; }
      .label { font-size: 12px; color: #666; margin-bottom: 4px; }
      .value { font-size: 14px; font-weight: bold; }
      .info { background: #e8f0fe; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 12px; }
      button { margin-top: 15px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <h2>⚙️ Current Settings</h2>
    <div class="row"><div class="label">Content Type</div><div class="value">${settings.contentType}</div></div>
    <div class="row"><div class="label">Episodes</div><div class="value">${settings.episodes}</div></div>
    <div class="row"><div class="label">Scenes per Episode</div><div class="value">${settings.scenesPerEp}</div></div>
    <div class="row"><div class="label">Genre (auto)</div><div class="value">${settings.genre || '(not set)'}</div></div>
    <div class="row"><div class="label">Style (auto)</div><div class="value">${settings.style || '(not set)'}</div></div>
    <div class="info">
      💡 Ubah settings di dropdown pada sheet 🎬 Story.<br>
      Genre & Style akan auto-detect dari synopsis.
    </div>
    <button onclick="google.script.host.close()">Close</button>
  `).setWidth(320).setHeight(340);
  
  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}

/**
 * Show help dialog
 */
function showHelp() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #1a73e8; margin-top: 0; }
      h3 { color: #34a853; margin-top: 20px; font-size: 14px; }
      ol, ul { padding-left: 20px; }
      li { margin: 6px 0; }
      .tip { background: #e8f0fe; padding: 12px; border-radius: 8px; margin: 15px 0; }
      button { margin-top: 15px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <h2>🎬 AI Filmmaking Studio</h2>
    
    <h3>🚀 Quick Start</h3>
    <ol>
      <li>Pilih <b>Content Type</b> (Drama, Film, TikTok, dll)</li>
      <li>Atur <b>Episodes</b> & <b>Scenes</b></li>
      <li>Tulis <b>Synopsis</b> (min 2-3 paragraf)</li>
      <li>Klik <b>🚀 Generate All</b></li>
    </ol>
    
    <div class="tip">
      <b>💡 Tips:</b> Semakin detail synopsis, semakin bagus hasilnya. 
      Sertakan nama karakter, setting, dan konflik.
    </div>
    
    <h3>📋 After Generation</h3>
    <ul>
      <li>Review Characters di tab 👥</li>
      <li>Review Episodes/Scenes di tab 🎬</li>
      <li>Generate Storyboard untuk visual</li>
      <li>Copy prompts untuk AI tools</li>
    </ul>
    
    <h3>🎨 Copy Prompts</h3>
    <ul>
      <li><b>Image Prompt</b> → Midjourney, DALL-E, Flux</li>
      <li><b>Video Prompt</b> → VEO 3, Runway, Pika, Kling</li>
    </ul>
    
    <h3>📁 New Project</h3>
    <p>Klik <b>📁 New Project (Reset)</b> untuk mulai project baru dengan template kosong.</p>
    
    <button onclick="google.script.host.close()">Close</button>
  `).setWidth(420).setHeight(520);
  
  SpreadsheetApp.getUi().showModalDialog(html, '❓ Help');
}

/**
 * Copy image prompt for selected asset
 */
function copyImagePrompt() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < ASSETS.DATA_START_ROW) {
    alert('❌ Select an asset row in 🎨 Assets sheet.');
    return;
  }
  
  const prompt = sheet.getRange(row, ASSETS.COL.IMAGE_PROMPT).getValue();
  const id = sheet.getRange(row, ASSETS.COL.ID).getValue();
  const scene = sheet.getRange(row, ASSETS.COL.SCENE).getValue();
  
  if (!prompt) {
    alert('❌ No image prompt found.\n\nGenerate storyboard first.');
    return;
  }
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      h3 { color: #1a73e8; margin-top: 0; }
      .info { color: #666; font-size: 12px; margin-bottom: 10px; }
      textarea { width: 100%; height: 180px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; }
      button { margin-top: 10px; padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .tools { font-size: 11px; color: #666; margin-top: 12px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>
    <h3>🖼️ Image Prompt</h3>
    <div class="info">Asset: ${id} | Scene: ${scene}</div>
    <textarea id="p" readonly>${prompt}</textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('p').value);alert('✅ Copied!')">📋 Copy</button>
    <div class="tools"><b>Use with:</b> Midjourney, DALL-E, Stable Diffusion, Flux</div>
  `).setWidth(500).setHeight(340);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Image Prompt');
}

/**
 * Copy video prompt for selected asset
 */
function copyVideoPrompt() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < ASSETS.DATA_START_ROW) {
    alert('❌ Select an asset row in 🎨 Assets sheet.');
    return;
  }
  
  const prompt = sheet.getRange(row, ASSETS.COL.VIDEO_PROMPT).getValue();
  const id = sheet.getRange(row, ASSETS.COL.ID).getValue();
  const scene = sheet.getRange(row, ASSETS.COL.SCENE).getValue();
  
  if (!prompt) {
    alert('❌ No video prompt found.\n\nGenerate storyboard first.');
    return;
  }
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      h3 { color: #34a853; margin-top: 0; }
      .info { color: #666; font-size: 12px; margin-bottom: 10px; }
      textarea { width: 100%; height: 160px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; }
      button { margin-top: 10px; padding: 12px 24px; background: #34a853; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .tools { font-size: 11px; color: #666; margin-top: 12px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>
    <h3>🎬 Video Prompt</h3>
    <div class="info">Asset: ${id} | Scene: ${scene}</div>
    <textarea id="p" readonly>${prompt}</textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('p').value);alert('✅ Copied!')">📋 Copy</button>
    <div class="tools"><b>Use with:</b> VEO 3, Runway Gen-3, Pika, Kling, Luma</div>
  `).setWidth(500).setHeight(320);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Video Prompt');
}

/**
 * Export all prompts
 */
function exportPrompts() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < ASSETS.DATA_START_ROW) {
    alert('❌ No assets found.\n\nGenerate storyboard first.');
    return;
  }
  
  const numRows = lastRow - ASSETS.DATA_START_ROW + 1;
  const data = sheet.getRange(ASSETS.DATA_START_ROW, 1, numRows, 10).getValues();
  
  let output = '# AI Filmmaking - All Prompts\\n';
  output += '# Generated: ' + new Date().toLocaleString() + '\\n\\n';
  
  data.forEach(row => {
    if (!row[0]) return;
    
    output += '## Scene ' + row[1] + ' - Act ' + row[2] + '\\n';
    output += 'Description: ' + row[3] + '\\n\\n';
    output += '### Image Prompt\\n' + (row[5] || 'N/A') + '\\n\\n';
    output += '### Video Prompt\\n' + (row[6] || 'N/A') + '\\n\\n';
    output += '---\\n\\n';
  });
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: monospace; padding: 15px; }
      textarea { width: 100%; height: 380px; padding: 10px; font-size: 11px; }
      button { margin-top: 10px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <textarea id="o" readonly>${output}</textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('o').value);alert('✅ Copied!')">📋 Copy All</button>
  `).setWidth(600).setHeight(480);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📄 Export Prompts');
}

