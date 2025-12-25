/**
 * Code.gs - Main Entry Point V7
 * Menu creation and UI functions
 * UPDATED: Added prompt regeneration, copy functions, better menu
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
    
    // Prompts
    .addSubMenu(ui.createMenu('📋 Prompts')
      .addItem('🔄 Regenerate Prompts (Selected Row)', 'regeneratePrompts')
      .addItem('📋 Copy Prompt Dialog', 'copyPromptDialog')
      .addItem('📄 Export All Prompts', 'exportAllPrompts'))
    
    // Characters
    .addSubMenu(ui.createMenu('👥 Characters')
      .addItem('Generate Character Reference', 'generateCharRef')
      .addItem('Generate All References', 'generateAllCharRefs')
      .addItem('Update Character Dropdowns', 'updateCharacterDropdowns'))
    
    // Assets
    .addSubMenu(ui.createMenu('🎨 Assets')
      .addItem('Generate Storyboard', 'generateStoryboard')
      .addItem('Copy Text-to-Image Prompt', 'copyTxt2ImgPrompt')
      .addItem('Copy Image-to-Image Prompt', 'copyImg2ImgPrompt')
      .addItem('Copy Image-to-Video Prompt', 'copyImg2VidPrompt'))
    
    .addSeparator()
    
    // Project management
    .addItem('📁 New Project (Reset)', 'resetTemplate')
    .addItem('⚙️ Setup Template', 'setupTemplate')
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
 * Show help dialog - UPDATED
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
      .prompt-info { background: #fff3e0; padding: 12px; border-radius: 8px; margin: 15px 0; }
      button { margin-top: 15px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <h2>🎬 AI Filmmaking Studio V7</h2>
    
    <h3>🚀 Quick Start</h3>
    <ol>
      <li>Pilih <b>Content Type</b> (Drama, Film, TikTok, dll)</li>
      <li>Atur <b>Episodes</b> & <b>Scenes</b></li>
      <li>Tulis <b>Synopsis</b> dalam Bahasa Indonesia</li>
      <li>Klik <b>🚀 Generate All</b></li>
    </ol>
    
    <div class="tip">
      <b>💡 Tips:</b> Sebutkan nama karakter di synopsis (Ahmad, Siti, Kyai Hasan, dll).
    </div>
    
    <h3>📋 3 Jenis Prompt</h3>
    <div class="prompt-info">
      <b>🖼️ Text-to-Image:</b> Midjourney, DALL-E, Dreamina, Flux<br>
      <b>🔄 Image-to-Image:</b> Whisk, Photoshop AI, ComfyUI<br>
      <b>🎬 Image-to-Video:</b> Runway, Pika, Hailuo, VEO, Kling
    </div>
    
    <h3>📊 Sheet Overview</h3>
    <ul>
      <li><b>🎬 Story</b> - Episode, Scene, Act + Prompts</li>
      <li><b>👥 Characters</b> - Karakter + Character Prompt</li>
      <li><b>🎨 Assets</b> - Semua prompt lengkap</li>
      <li><b>📊 Overview</b> - Ringkasan cerita</li>
    </ul>
    
    <h3>🔄 Edit & Update</h3>
    <p>Jika edit adegan, pilih baris lalu klik <b>📋 Prompts → Regenerate</b> untuk update prompt.</p>
    
    <button onclick="google.script.host.close()">Tutup</button>
  `).setWidth(450).setHeight(580);
  
  SpreadsheetApp.getUi().showModalDialog(html, '❓ Help');
}

/**
 * Copy Text-to-Image prompt
 */
function copyTxt2ImgPrompt() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < ASSETS.DATA_START_ROW) {
    alert('❌ Pilih baris asset di sheet 🎨 Assets.');
    return;
  }
  
  const prompt = sheet.getRange(row, ASSETS.COL.TXT2IMG_PROMPT).getValue();
  const scene = sheet.getRange(row, ASSETS.COL.SCENE).getValue();
  const act = sheet.getRange(row, ASSETS.COL.ACT).getValue();
  
  if (!prompt) {
    alert('❌ Prompt kosong. Generate dulu.');
    return;
  }
  
  showCopyDialog('🖼️ Text-to-Image Prompt', prompt, scene, act, 
    'Midjourney, DALL-E, Dreamina, Stable Diffusion, Flux');
}

/**
 * Copy Image-to-Image prompt
 */
function copyImg2ImgPrompt() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < ASSETS.DATA_START_ROW) {
    alert('❌ Pilih baris asset di sheet 🎨 Assets.');
    return;
  }
  
  const prompt = sheet.getRange(row, ASSETS.COL.IMG2IMG_PROMPT).getValue();
  const scene = sheet.getRange(row, ASSETS.COL.SCENE).getValue();
  const act = sheet.getRange(row, ASSETS.COL.ACT).getValue();
  
  if (!prompt) {
    alert('❌ Prompt kosong. Generate dulu.');
    return;
  }
  
  showCopyDialog('🔄 Image-to-Image Prompt', prompt, scene, act, 
    'Whisk, Photoshop AI, ComfyUI, ControlNet');
}

/**
 * Copy Image-to-Video prompt
 */
function copyImg2VidPrompt() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < ASSETS.DATA_START_ROW) {
    alert('❌ Pilih baris asset di sheet 🎨 Assets.');
    return;
  }
  
  const prompt = sheet.getRange(row, ASSETS.COL.IMG2VID_PROMPT).getValue();
  const scene = sheet.getRange(row, ASSETS.COL.SCENE).getValue();
  const act = sheet.getRange(row, ASSETS.COL.ACT).getValue();
  
  if (!prompt) {
    alert('❌ Prompt kosong. Generate dulu.');
    return;
  }
  
  showCopyDialog('🎬 Image-to-Video Prompt', prompt, scene, act, 
    'Runway Gen-3, Pika, Hailuo, VEO 3, Kling, Luma');
}

/**
 * Show copy dialog
 */
function showCopyDialog(title, prompt, scene, act, tools) {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      h3 { color: #1a73e8; margin-top: 0; }
      .info { color: #666; font-size: 12px; margin-bottom: 10px; }
      textarea { width: 100%; height: 180px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; }
      button { margin-top: 10px; padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .tools { font-size: 11px; color: #666; margin-top: 12px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>
    <h3>${title}</h3>
    <div class="info">Scene: ${scene} | Act: ${act}</div>
    <textarea id="p" readonly>${prompt}</textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('p').value);alert('✅ Copied!')">📋 Copy to Clipboard</button>
    <div class="tools"><b>Paste ke:</b> ${tools}</div>
  `).setWidth(520).setHeight(360);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Copy Prompt');
}

/**
 * Export all prompts to text
 */
function exportAllPrompts() {
  const sheet = getAssetsSheet();
  if (!sheet) {
    alert('❌ Assets sheet not found.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < ASSETS.DATA_START_ROW) {
    alert('❌ Belum ada assets. Generate dulu.');
    return;
  }
  
  const numRows = lastRow - ASSETS.DATA_START_ROW + 1;
  const data = sheet.getRange(ASSETS.DATA_START_ROW, 1, numRows, 11).getValues();
  
  let output = '# AI Filmmaking - All Prompts\n';
  output += '# Generated: ' + new Date().toLocaleString() + '\n\n';
  
  data.forEach(row => {
    if (!row[0]) return;
    
    output += '## Scene ' + row[1] + ' - Act ' + row[2] + '\n';
    output += 'Description: ' + row[3] + '\n\n';
    output += '### 🖼️ Text-to-Image\n' + (row[5] || 'N/A') + '\n\n';
    output += '### 🔄 Image-to-Image\n' + (row[6] || 'N/A') + '\n\n';
    output += '### 🎬 Image-to-Video\n' + (row[7] || 'N/A') + '\n\n';
    output += '---\n\n';
  });
  
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: monospace; padding: 15px; }
      h3 { margin-top: 0; }
      textarea { width: 100%; height: 380px; padding: 10px; font-size: 11px; }
      button { margin-top: 10px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <h3>📄 All Prompts</h3>
    <textarea id="o" readonly>${output}</textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('o').value);alert('✅ Copied!')">📋 Copy All</button>
  `).setWidth(650).setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📄 Export All Prompts');
}
