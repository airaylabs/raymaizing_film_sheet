/**
 * Generator.gs - Main Generation Logic V7
 * MAJOR IMPROVEMENTS:
 * - Smart character extraction (PEOPLE only, not locations!)
 * - All output in Bahasa Indonesia
 * - 3 types of prompts: Text2Img, Img2Img, Img2Vid
 * - Better structure: Episode=ringkasan, Scene=cerita, Act=adegan+dialog
 * - Shorter location/costume descriptions
 * - Auto-update prompts when content changes
 */

/**
 * Main function - Generate All from Synopsis
 */
function generateAll() {
  const ui = SpreadsheetApp.getUi();
  
  // Validate
  const synopsis = getSynopsis();
  if (!synopsis || synopsis.length < 100) {
    alert('❌ Synopsis terlalu pendek!\n\nMinimal 100 karakter.');
    return;
  }
  
  if (synopsis.indexOf('Tulis synopsis') >= 0) {
    alert('❌ Silakan tulis synopsis cerita kamu.');
    return;
  }
  
  const settings = getSettings();
  const totalScenes = settings.episodes * settings.scenesPerEp;
  
  // Confirm
  const confirm = ui.alert(
    '🚀 Generate All',
    'Content: ' + settings.contentType + '\n\n' +
    'Akan generate:\n' +
    '• ' + settings.episodes + ' episode\n' +
    '• ' + totalScenes + ' scene\n' +
    '• ' + (totalScenes * 4) + ' act\n' +
    '• Karakter + 3 jenis Prompt\n\n' +
    'Semua output dalam Bahasa Indonesia.\n' +
    'Waktu: 3-5 menit. Lanjutkan?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  const startTime = new Date();
  let stats = { chars: 0, eps: 0, scenes: 0, acts: 0, prompts: 0 };
  
  try {
    // ========== BATCH 1: Analyze Synopsis ==========
    toast('🔄 Batch 1/6: Menganalisis synopsis...', '🎬', 30);
    
    const basicInfo = analyzeBasicInfoIndonesian(synopsis);
    Logger.log('Basic info: ' + JSON.stringify(basicInfo));
    
    setAutoValues(
      basicInfo.genre || 'Drama',
      basicInfo.style || 'Cinematic',
      basicInfo.projectName || 'Project Saya'
    );
    
    Utilities.sleep(1500);
    
    // ========== BATCH 2: Extract REAL Character Names ==========
    toast('🔄 Batch 2/6: Mencari karakter...', '🎬', 30);
    
    const charNames = extractSmartCharacters(synopsis, basicInfo);
    Logger.log('Character names: ' + JSON.stringify(charNames));
    
    if (charNames.length === 0) {
      throw new Error('Tidak ada karakter ditemukan.');
    }
    
    Utilities.sleep(1500);
    
    // ========== BATCH 3: Get Character Details ==========
    toast('🔄 Batch 3/6: Membuat detail karakter...', '🎬', 60);
    
    const characters = [];
    for (let i = 0; i < Math.min(charNames.length, 5); i++) {
      toast(`🔄 Karakter ${i+1}/${Math.min(charNames.length, 5)}: ${charNames[i]}...`, '🎬', 20);
      
      const charDetail = getCharacterDetailSmart(charNames[i], synopsis, i, basicInfo);
      characters.push(charDetail);
      
      Utilities.sleep(1500);
    }
    
    writeCharactersWithPrompts(characters, basicInfo.style);
    stats.chars = characters.length;
    
    Utilities.sleep(1500);
    
    // ========== BATCH 4: Generate Episodes ==========
    toast('🔄 Batch 4/6: Membuat episode...', '🎬', 60);
    
    const episodes = [];
    for (let i = 1; i <= settings.episodes; i++) {
      toast(`🔄 Episode ${i}/${settings.episodes}...`, '🎬', 20);
      
      const ep = generateEpisodeIndonesian(i, settings.episodes, synopsis, characters, basicInfo);
      episodes.push(ep);
      
      Utilities.sleep(1500);
    }
    
    stats.eps = episodes.length;
    
    Utilities.sleep(1500);
    
    // ========== BATCH 5: Generate Scenes with Acts ==========
    toast('🔄 Batch 5/6: Membuat scene & act...', '🎬', 120);
    
    for (let i = 0; i < episodes.length; i++) {
      const ep = episodes[i];
      ep.scenes = [];
      
      for (let j = 1; j <= settings.scenesPerEp; j++) {
        toast(`🔄 Episode ${i+1}, Scene ${j}/${settings.scenesPerEp}...`, '🎬', 20);
        
        const scene = generateSceneWithActs(ep, j, settings.scenesPerEp, characters, basicInfo);
        ep.scenes.push(scene);
        stats.scenes++;
        stats.acts += 4;
        stats.prompts += 12; // 3 prompts x 4 acts
        
        Utilities.sleep(2000);
      }
    }
    
    // Write to Story sheet with prompts
    writeStoryWithPrompts(episodes, characters, basicInfo);
    
    // ========== BATCH 6: Write Assets ==========
    toast('🔄 Batch 6/6: Menyimpan assets...', '🎬', 30);
    writeAssetsWithAllPrompts(episodes, characters, basicInfo);
    
    // Update Overview
    updateOverview(episodes);
    
    const duration = Math.round((new Date() - startTime) / 1000);
    
    showSummaryIndonesian(stats, duration, basicInfo.projectName, basicInfo.genre, basicInfo.style);
    
  } catch (e) {
    Logger.log('Error: ' + e.message);
    alert('❌ Error\n\n' + e.message);
  }
}

/**
 * BATCH 1: Analyze basic info
 */
function analyzeBasicInfoIndonesian(synopsis) {
  const shortSynopsis = synopsis.substring(0, 500);
  
  const prompt = `Analisis cerita berikut:

"${shortSynopsis}"

Tentukan genre, style visual, dan judul project.
Jawab dalam JSON saja:
{"genre":"Drama","style":"Cinematic","projectName":"Judul 2-4 Kata","setting":"Lokasi utama","theme":"Tema cerita"}

Pilihan genre: Drama, Action, Comedy, Horror, Romance, Thriller, Documentary
Pilihan style: Cinematic, Anime, Realistic, Cartoon`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.genre) {
      return parsed;
    }
  }
  
  return detectContextFromSynopsis(synopsis);
}

/**
 * Detect context from synopsis for fallback
 */
function detectContextFromSynopsis(synopsis) {
  const lower = synopsis.toLowerCase();
  
  if (lower.includes('santri') || lower.includes('pesantren') || lower.includes('kyai')) {
    return {
      genre: 'Documentary',
      style: 'Cinematic',
      projectName: 'Jejak Santri',
      setting: 'Pesantren',
      theme: 'Perjalanan spiritual'
    };
  } else if (lower.includes('cinta') || lower.includes('jatuh cinta')) {
    return {
      genre: 'Romance',
      style: 'Cinematic',
      projectName: 'Kisah Cinta',
      setting: 'Indonesia',
      theme: 'Percintaan'
    };
  }
  
  return {
    genre: 'Drama',
    style: 'Cinematic',
    projectName: 'Cerita Kita',
    setting: 'Indonesia',
    theme: 'Kehidupan'
  };
}

/**
 * BATCH 2: Extract SMART characters
 */
function extractSmartCharacters(synopsis, basicInfo) {
  const shortSynopsis = synopsis.substring(0, 800);
  
  const prompt = `Baca cerita ini:
"${shortSynopsis}"

Identifikasi KARAKTER (ORANG) dalam cerita.

ATURAN:
1. Karakter = ORANG yang berperan
2. BUKAN lokasi (Ciamis, Pesantren = BUKAN karakter!)
3. Jika "santri" tanpa nama → buat nama: "Ahmad"
4. Jika "kyai" tanpa nama → buat nama: "Kyai Hasan"

Berikan 4-5 nama karakter.
Jawab dalam JSON array saja:
["Nama 1", "Nama 2", "Nama 3", "Nama 4"]`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const filtered = parsed.filter(name => !isDefinitelyLocation(name));
      if (filtered.length >= 2) {
        return filtered.slice(0, 5);
      }
    }
  }
  
  return createSmartCharacterNames(synopsis, basicInfo);
}

/**
 * Check if name is a location
 */
function isDefinitelyLocation(name) {
  if (!name || typeof name !== 'string') return true;
  
  const nameLower = name.toLowerCase().trim();
  const locations = [
    'pondok', 'pesantren', 'darussalam', 'ciamis', 'jawa', 'barat', 'timur',
    'jakarta', 'bandung', 'surabaya', 'indonesia', 'masjid', 'sekolah'
  ];
  
  for (const loc of locations) {
    if (nameLower === loc || nameLower.includes('pondok pesantren')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create smart character names based on context
 */
function createSmartCharacterNames(synopsis, basicInfo) {
  const lower = synopsis.toLowerCase();
  
  if (lower.includes('santri') || lower.includes('pesantren')) {
    return ['Ahmad Fauzi', 'Siti Aisyah', 'Kyai Hasan', 'Ustadz Mahmud', 'Bu Nyai Fatimah'];
  } else if (lower.includes('sekolah') || lower.includes('siswa')) {
    return ['Budi Santoso', 'Ani Wijaya', 'Pak Hendra', 'Bu Sari'];
  }
  
  return ['Andi Pratama', 'Sari Dewi', 'Budi Santoso', 'Ani Wijaya'];
}

/**
 * BATCH 3: Get character detail
 */
function getCharacterDetailSmart(name, synopsis, index, basicInfo) {
  const shortSynopsis = synopsis.substring(0, 300);
  const roles = ['Protagonist', 'Supporting', 'Supporting', 'Supporting', 'Minor'];
  const defaultRole = roles[index] || 'Supporting';
  
  const prompt = `Karakter "${name}" dalam cerita: "${shortSynopsis}"

Buat deskripsi untuk AI image generator.
Jawab dalam JSON saja:
{
"name":"${name}",
"role":"${defaultRole}",
"age":"usia",
"gender":"Pria atau Wanita",
"appearance":"Deskripsi fisik 30-50 kata: kulit, rambut, wajah, pakaian khas",
"personality":"sifat utama"
}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.name) {
      parsed.role = validateRole(parsed.role || defaultRole);
      parsed.gender = validateGender(parsed.gender);
      if (!parsed.appearance || parsed.appearance.length < 20) {
        parsed.appearance = createDetailedAppearance(name, parsed.gender, parsed.age, basicInfo);
      }
      return parsed;
    }
  }
  
  return createSmartCharacterFallback(name, index, basicInfo);
}

/**
 * Create detailed appearance
 */
function createDetailedAppearance(name, gender, age, basicInfo) {
  const setting = (basicInfo.setting || '').toLowerCase();
  const nameLower = name.toLowerCase();
  
  if (setting.includes('pesantren') || nameLower.includes('kyai') || nameLower.includes('ustadz')) {
    if (gender === 'Wanita') {
      return 'Wanita Indonesia, kulit sawo matang, jilbab putih, gamis pastel, wajah lembut, mata hangat';
    } else if (nameLower.includes('kyai')) {
      return 'Pria paruh baya, kulit sawo matang, jenggot putih, peci hitam, jubah putih, wibawa';
    } else {
      return 'Pemuda Indonesia, kulit sawo matang, rambut hitam pendek, peci putih, baju koko putih, sarung';
    }
  }
  
  if (gender === 'Wanita') {
    return 'Wanita Indonesia muda, kulit kuning langsat, rambut hitam panjang, wajah oval, pakaian sopan';
  }
  return 'Pria Indonesia muda, kulit sawo matang, rambut hitam pendek, wajah tegas, kemeja rapi';
}

/**
 * Create character fallback
 */
function createSmartCharacterFallback(name, index, basicInfo) {
  const nameLower = name.toLowerCase();
  
  let gender = 'Pria';
  if (nameLower.includes('siti') || nameLower.includes('aisyah') || nameLower.includes('bu ') || nameLower.includes('nyai')) {
    gender = 'Wanita';
  }
  
  let age = '22';
  if (nameLower.includes('kyai') || nameLower.includes('pak ') || nameLower.includes('bu ')) {
    age = '50';
  }
  
  return {
    name: name,
    role: index === 0 ? 'Protagonist' : 'Supporting',
    age: age,
    gender: gender,
    appearance: createDetailedAppearance(name, gender, age, basicInfo),
    personality: 'Baik hati, sopan, bertanggung jawab'
  };
}

/**
 * Validate role
 */
function validateRole(role) {
  const validRoles = ['Protagonist', 'Antagonist', 'Supporting', 'Minor'];
  if (validRoles.includes(role)) return role;
  return 'Supporting';
}

/**
 * Validate gender
 */
function validateGender(gender) {
  const genderLower = (gender || '').toLowerCase();
  if (genderLower.includes('female') || genderLower.includes('perempuan') || genderLower.includes('wanita')) return 'Wanita';
  return 'Pria';
}

/**
 * BATCH 4: Generate episode - ringkasan alur
 */
function generateEpisodeIndonesian(epNumber, totalEps, synopsis, characters, basicInfo) {
  const charNames = characters.slice(0, 3).map(c => c.name).join(', ');
  const shortSynopsis = synopsis.substring(0, 400);
  
  let focus = '';
  if (epNumber === 1) focus = 'Perkenalan karakter dan setting';
  else if (epNumber === totalEps) focus = 'Klimaks dan resolusi';
  else focus = 'Pengembangan konflik';
  
  const prompt = `Cerita: "${shortSynopsis}"
Karakter: ${charNames}
Episode ${epNumber} dari ${totalEps}. Fokus: ${focus}

Buat judul dan RINGKASAN ALUR episode (2-3 kalimat).
Jawab dalam JSON:
{"number":${epNumber},"title":"Judul Episode","summary":"Ringkasan alur episode ini"}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.title) {
      parsed.number = epNumber;
      return parsed;
    }
  }
  
  return {
    number: epNumber,
    title: epNumber === 1 ? 'Awal Perjalanan' : (epNumber === totalEps ? 'Akhir Cerita' : 'Perjalanan Berlanjut'),
    summary: `Episode ${epNumber} menampilkan perkembangan cerita ${characters[0]?.name || 'karakter utama'}.`
  };
}

/**
 * BATCH 5: Generate scene with acts
 */
function generateSceneWithActs(episode, sceneNumber, totalScenes, characters, basicInfo) {
  const charName = characters[0]?.name || 'Karakter Utama';
  const setting = basicInfo.setting || 'Indonesia';
  
  const prompt = `Episode: "${episode.title}"
Scene ${sceneNumber} dari ${totalScenes}
Setting: ${setting}
Karakter: ${charName}

Buat scene dengan 4 act. Setiap act berisi ADEGAN + DIALOG/NARASI.

Jawab dalam JSON:
{
"number":${sceneNumber},
"title":"Judul Scene Singkat",
"location":"Lokasi singkat (max 5 kata)",
"time":"Pagi/Siang/Sore/Malam",
"characters":["${charName}"],
"costume":"Pakaian singkat (max 5 kata)",
"acts":[
{"act":"A","description":"Adegan pembuka + narasi/dialog","shot":"Wide"},
{"act":"B","description":"Adegan pengembangan + dialog","shot":"Medium"},
{"act":"C","description":"Adegan klimaks + dialog emosional","shot":"Close-up"},
{"act":"D","description":"Adegan penutup + narasi","shot":"Medium"}
]
}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.acts && parsed.acts.length >= 4) {
      parsed.number = sceneNumber;
      return parsed;
    }
  }
  
  return createFallbackScene(episode, sceneNumber, characters, basicInfo);
}

/**
 * Create fallback scene
 */
function createFallbackScene(episode, sceneNumber, characters, basicInfo) {
  const charName = characters[0]?.name || 'Karakter';
  const setting = (basicInfo.setting || '').toLowerCase();
  
  let location = 'Halaman utama';
  let costume = 'Pakaian sehari-hari';
  
  if (setting.includes('pesantren')) {
    location = 'Halaman pesantren';
    costume = 'Baju koko putih, peci';
  }
  
  const times = ['Pagi', 'Siang', 'Sore', 'Malam'];
  
  return {
    number: sceneNumber,
    title: `Scene ${sceneNumber}`,
    location: location,
    time: times[(sceneNumber - 1) % 4],
    characters: [charName],
    costume: costume,
    acts: [
      { act: 'A', description: `${charName} memasuki lokasi. Suasana tenang.`, shot: 'Wide' },
      { act: 'B', description: `${charName} berjalan perlahan. "Aku harus kuat," batinnya.`, shot: 'Medium' },
      { act: 'C', description: `Close-up wajah ${charName}. Air mata mengalir.`, shot: 'Close-up' },
      { act: 'D', description: `${charName} mengangguk dan berjalan pergi.`, shot: 'Medium' }
    ]
  };
}


/**
 * Write characters with prompts to sheet
 */
function writeCharactersWithPrompts(characters, style) {
  const sheet = getCharsSheet();
  if (!sheet || !characters || characters.length === 0) return;
  
  // Clear existing
  const lastRow = sheet.getLastRow();
  if (lastRow >= CHARS.DATA_START_ROW) {
    sheet.getRange(CHARS.DATA_START_ROW, 1, lastRow - CHARS.DATA_START_ROW + 1, 10).clear();
  }
  
  characters.forEach((char, i) => {
    const row = CHARS.DATA_START_ROW + i;
    const seed = getSeed(char.name);
    
    // Build character prompt for AI tools
    const charPrompt = buildCharacterPrompt(char, style, seed);
    
    sheet.getRange(row, 1).setValue(char.name || 'Character ' + (i+1));
    sheet.getRange(row, 2).setValue(char.role || 'Supporting');
    sheet.getRange(row, 3).setValue(char.age || '25');
    sheet.getRange(row, 4).setValue(char.gender || 'Pria');
    sheet.getRange(row, 5).setValue(char.appearance || '');
    sheet.getRange(row, 6).setValue(seed);
    sheet.getRange(row, 7).setValue(char.personality || '');
    sheet.getRange(row, 9).setValue('Baru');
    sheet.getRange(row, 10).setValue(charPrompt);  // Character prompt
    
    sheet.setRowHeight(row, 60);
  });
}

/**
 * Build character reference prompt
 */
function buildCharacterPrompt(char, style, seed) {
  const parts = [];
  
  parts.push('Character reference sheet, full body, front view');
  parts.push(char.name);
  
  if (char.appearance) {
    parts.push(char.appearance);
  }
  
  parts.push('white background, character design');
  
  // Style
  const styleMap = {
    'Cinematic': 'realistic, detailed, professional',
    'Anime': 'anime style, vibrant colors',
    'Realistic': 'photorealistic, 8K quality',
    'Cartoon': 'cartoon style, bold colors'
  };
  parts.push(styleMap[style] || styleMap['Cinematic']);
  
  parts.push(`--seed ${seed}`);
  
  return parts.join(', ');
}

/**
 * Write story with prompts to sheet
 */
function writeStoryWithPrompts(episodes, characters, basicInfo) {
  const sheet = getStorySheet();
  if (!sheet) return;
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow >= STORY.DATA_START_ROW) {
    sheet.getRange(STORY.DATA_START_ROW, 1, lastRow - STORY.DATA_START_ROW + 1, 12).clear();
  }
  
  let row = STORY.DATA_START_ROW;
  
  episodes.forEach(ep => {
    // Episode row - RINGKASAN ALUR
    sheet.getRange(row, STORY.COL.ID).setValue(ep.number);
    sheet.getRange(row, STORY.COL.TYPE).setValue('EPISODE');
    sheet.getRange(row, STORY.COL.TITLE).setValue(ep.title + '\n\n' + (ep.summary || ''));
    sheet.getRange(row, STORY.COL.STATUS).setValue('Draft');
    sheet.getRange(row, 1, 1, 12).setBackground(COLORS.EPISODE).setFontWeight('bold');
    sheet.setRowHeight(row, 60);
    row++;
    
    if (ep.scenes) {
      ep.scenes.forEach(scene => {
        // Scene row - CERITA SCENE
        const sceneId = ep.number + '.' + scene.number;
        sheet.getRange(row, STORY.COL.ID).setValue(sceneId);
        sheet.getRange(row, STORY.COL.TYPE).setValue('SCENE');
        sheet.getRange(row, STORY.COL.TITLE).setValue(scene.title || 'Scene ' + scene.number);
        sheet.getRange(row, STORY.COL.LOCATION).setValue(scene.location || '');
        sheet.getRange(row, STORY.COL.TIME).setValue(scene.time || 'Pagi');
        sheet.getRange(row, STORY.COL.CHARACTERS).setValue((scene.characters || []).join(', '));
        sheet.getRange(row, STORY.COL.COSTUME).setValue(scene.costume || '');
        sheet.getRange(row, STORY.COL.STATUS).setValue('Draft');
        sheet.getRange(row, 1, 1, 12).setBackground(COLORS.SCENE);
        row++;
        
        // Act rows - ADEGAN + DIALOG + PROMPTS
        if (scene.acts) {
          scene.acts.forEach((act, ai) => {
            const actLetter = act.act || ['A','B','C','D'][ai];
            const actId = sceneId + actLetter;
            const actColors = { 'A': COLORS.ACT_A, 'B': COLORS.ACT_B, 'C': COLORS.ACT_C, 'D': COLORS.ACT_D };
            
            // Build prompts
            const txt2img = buildText2ImagePrompt(act, scene, characters, basicInfo);
            const img2img = buildImage2ImagePrompt(act, scene, characters, basicInfo);
            const img2vid = buildImage2VideoPrompt(act, scene, characters);
            
            sheet.getRange(row, STORY.COL.ID).setValue(actId);
            sheet.getRange(row, STORY.COL.TYPE).setValue('Act ' + actLetter);
            sheet.getRange(row, STORY.COL.TITLE).setValue(act.description || '');
            sheet.getRange(row, STORY.COL.LOCATION).setValue(scene.location || '');
            sheet.getRange(row, STORY.COL.TIME).setValue(scene.time || 'Pagi');
            sheet.getRange(row, STORY.COL.CHARACTERS).setValue((scene.characters || []).join(', '));
            sheet.getRange(row, STORY.COL.COSTUME).setValue(scene.costume || '');
            sheet.getRange(row, STORY.COL.SHOT).setValue(act.shot || 'Medium');
            sheet.getRange(row, STORY.COL.STATUS).setValue('Draft');
            sheet.getRange(row, STORY.COL.IMG_PROMPT).setValue(txt2img);
            sheet.getRange(row, STORY.COL.VID_PROMPT).setValue(img2vid);
            sheet.getRange(row, STORY.COL.NARRATION).setValue(extractNarration(act.description));
            
            sheet.getRange(row, 1, 1, 12).setBackground(actColors[actLetter] || COLORS.GRAY);
            sheet.setRowHeight(row, 80);
            
            row++;
          });
        }
      });
    }
  });
}

/**
 * Build Text-to-Image prompt (for Midjourney, DALL-E, Dreamina)
 */
function buildText2ImagePrompt(act, scene, characters, basicInfo) {
  const parts = [];
  
  // Shot type
  const shotMap = {
    'Wide': 'Wide establishing shot',
    'Medium': 'Medium shot, waist up',
    'Close-up': 'Close-up shot, face detail',
    'Extreme Close-up': 'Extreme close-up'
  };
  parts.push(shotMap[act.shot] || 'Medium shot');
  
  // Characters with appearance
  if (scene.characters && scene.characters.length > 0) {
    scene.characters.forEach(charName => {
      const char = characters.find(c => c.name === charName);
      if (char) {
        parts.push(`${char.name} (${char.appearance || 'Indonesian person'})`);
        if (scene.costume) {
          parts.push(`wearing ${scene.costume}`);
        }
      }
    });
  }
  
  // Location
  if (scene.location) {
    parts.push(`in ${scene.location}`);
  }
  
  // Action
  if (act.description) {
    // Extract visual part only
    const visual = act.description.split('"')[0].trim();
    if (visual) parts.push(visual);
  }
  
  // Time/Lighting
  const lightMap = {
    'Pagi': 'morning golden hour light',
    'Siang': 'bright daylight',
    'Sore': 'warm sunset light',
    'Malam': 'night scene, moonlight'
  };
  parts.push(lightMap[scene.time] || 'natural lighting');
  
  // Style
  const styleMap = {
    'Cinematic': 'cinematic, 35mm film, shallow depth of field',
    'Anime': 'anime style, vibrant colors, cel shading',
    'Realistic': 'photorealistic, 8K, detailed',
    'Cartoon': 'cartoon style, bold colors'
  };
  parts.push(styleMap[basicInfo.style] || styleMap['Cinematic']);
  
  parts.push('high quality, detailed');
  
  return parts.join(', ');
}

/**
 * Build Image-to-Image prompt (for Whisk, Photoshop AI)
 */
function buildImage2ImagePrompt(act, scene, characters, basicInfo) {
  const parts = [];
  
  parts.push('Combine these elements:');
  
  // Background
  if (scene.location) {
    parts.push(`Background: ${scene.location}`);
  }
  
  // Characters
  if (scene.characters && scene.characters.length > 0) {
    const charList = scene.characters.map(name => {
      const char = characters.find(c => c.name === name);
      return char ? `${char.name} (use reference image)` : name;
    });
    parts.push(`Characters: ${charList.join(', ')}`);
  }
  
  // Costume
  if (scene.costume) {
    parts.push(`Costume: ${scene.costume}`);
  }
  
  // Action
  if (act.description) {
    const visual = act.description.split('"')[0].trim();
    if (visual) parts.push(`Action: ${visual}`);
  }
  
  // Style
  parts.push(`Style: ${basicInfo.style || 'Cinematic'}`);
  parts.push('Maintain consistent lighting and style');
  
  return parts.join('. ');
}

/**
 * Build Image-to-Video prompt (for Runway, Pika, Hailuo, VEO)
 */
function buildImage2VideoPrompt(act, scene, characters) {
  const parts = [];
  
  // Shot type
  parts.push(`${act.shot || 'Medium'} shot`);
  
  // Subject
  if (scene.characters && scene.characters.length > 0) {
    parts.push(`of ${scene.characters.slice(0, 2).join(' and ')}`);
  }
  
  // Location
  if (scene.location) {
    parts.push(`in ${scene.location}`);
  }
  
  // Action from description
  if (act.description) {
    const visual = act.description.split('"')[0].trim();
    if (visual) parts.push(visual);
  }
  
  // Camera movement
  const cameraMap = {
    'A': 'Camera slowly pushes in',
    'B': 'Camera tracks movement',
    'C': 'Camera holds steady',
    'D': 'Camera slowly pulls back'
  };
  parts.push(cameraMap[act.act] || 'Smooth camera movement');
  
  // Time
  const lightMap = {
    'Pagi': 'morning light',
    'Siang': 'daylight',
    'Sore': 'sunset light',
    'Malam': 'night lighting'
  };
  parts.push(lightMap[scene.time] || 'natural lighting');
  
  parts.push('Duration: 8 seconds, cinematic quality, smooth motion');
  
  return parts.join(', ');
}

/**
 * Extract narration/dialog from description
 */
function extractNarration(description) {
  if (!description) return '';
  
  // Extract text in quotes as dialog
  const dialogMatch = description.match(/"([^"]+)"/g);
  if (dialogMatch) {
    return dialogMatch.join(' ');
  }
  
  // If no dialog, return short narration
  const sentences = description.split('.');
  if (sentences.length > 1) {
    return sentences[sentences.length - 1].trim();
  }
  
  return '';
}

/**
 * Write assets with all 3 prompt types
 */
function writeAssetsWithAllPrompts(episodes, characters, basicInfo) {
  const sheet = getAssetsSheet();
  if (!sheet) return;
  
  // Clear existing
  const lastRow = sheet.getLastRow();
  if (lastRow >= ASSETS.DATA_START_ROW) {
    sheet.getRange(ASSETS.DATA_START_ROW, 1, lastRow - ASSETS.DATA_START_ROW + 1, 11).clear();
  }
  
  let assetId = 1;
  let row = ASSETS.DATA_START_ROW;
  
  episodes.forEach(ep => {
    if (ep.scenes) {
      ep.scenes.forEach(scene => {
        if (scene.acts) {
          scene.acts.forEach((act, ai) => {
            const actLetter = act.act || ['A','B','C','D'][ai];
            const sceneId = ep.number + '.' + scene.number;
            
            // Build all 3 prompts
            const txt2img = buildText2ImagePrompt(act, scene, characters, basicInfo);
            const img2img = buildImage2ImagePrompt(act, scene, characters, basicInfo);
            const img2vid = buildImage2VideoPrompt(act, scene, characters);
            
            // Get seed for consistency
            const mainChar = characters.find(c => scene.characters && scene.characters.includes(c.name));
            const seed = mainChar ? getSeed(mainChar.name) : getSeed(sceneId + actLetter);
            
            // Generate preview image
            let imageUrl = '';
            try {
              imageUrl = generateImage(txt2img, { seed: seed, width: 1280, height: 720 });
            } catch (e) {
              Logger.log('Image error: ' + e.message);
            }
            
            sheet.getRange(row, ASSETS.COL.ID).setValue(assetId);
            sheet.getRange(row, ASSETS.COL.SCENE).setValue(sceneId);
            sheet.getRange(row, ASSETS.COL.ACT).setValue(actLetter);
            sheet.getRange(row, ASSETS.COL.DESCRIPTION).setValue(act.description || '');
            sheet.getRange(row, ASSETS.COL.TXT2IMG_PROMPT).setValue(txt2img);
            sheet.getRange(row, ASSETS.COL.IMG2IMG_PROMPT).setValue(img2img);
            sheet.getRange(row, ASSETS.COL.IMG2VID_PROMPT).setValue(img2vid);
            sheet.getRange(row, ASSETS.COL.STATUS).setValue(imageUrl ? 'Generated' : 'Pending');
            sheet.getRange(row, ASSETS.COL.DURATION).setValue('8s');
            
            if (imageUrl) {
              sheet.getRange(row, ASSETS.COL.IMAGE_URL).setValue(imageUrl);
              try {
                sheet.getRange(row, ASSETS.COL.PREVIEW).setFormula('=IMAGE("' + imageUrl + '",1)');
              } catch (e) {}
              sheet.setRowHeight(row, 80);
            } else {
              sheet.setRowHeight(row, 60);
            }
            
            assetId++;
            row++;
          });
        }
      });
    }
  });
}

/**
 * Update Overview sheet
 */
function updateOverview(episodes) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.OVERVIEW);
  if (!sheet) return;
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow >= OVERVIEW.DATA_START_ROW + 1) {
    sheet.getRange(OVERVIEW.DATA_START_ROW + 1, 1, lastRow - OVERVIEW.DATA_START_ROW, 5).clear();
  }
  
  let row = OVERVIEW.DATA_START_ROW + 1;
  
  episodes.forEach(ep => {
    // Episode row
    sheet.getRange(row, 1).setValue('📺 Episode');
    sheet.getRange(row, 2).setValue(ep.number);
    sheet.getRange(row, 3).setValue(ep.title);
    sheet.getRange(row, 4).setValue(ep.summary || '');
    sheet.getRange(row, 5).setValue('Draft');
    sheet.getRange(row, 1, 1, 5).setBackground(COLORS.EPISODE);
    row++;
    
    if (ep.scenes) {
      ep.scenes.forEach(scene => {
        // Scene row
        sheet.getRange(row, 1).setValue('🎬 Scene');
        sheet.getRange(row, 2).setValue(ep.number + '.' + scene.number);
        sheet.getRange(row, 3).setValue(scene.title || '');
        sheet.getRange(row, 4).setValue(scene.location + ' - ' + scene.time);
        sheet.getRange(row, 5).setValue('Draft');
        sheet.getRange(row, 1, 1, 5).setBackground(COLORS.SCENE);
        row++;
        
        // Acts
        if (scene.acts) {
          scene.acts.forEach((act, ai) => {
            const actLetter = act.act || ['A','B','C','D'][ai];
            const actColors = { 'A': COLORS.ACT_A, 'B': COLORS.ACT_B, 'C': COLORS.ACT_C, 'D': COLORS.ACT_D };
            
            sheet.getRange(row, 1).setValue('🎭 Act ' + actLetter);
            sheet.getRange(row, 2).setValue(ep.number + '.' + scene.number + actLetter);
            sheet.getRange(row, 3).setValue(act.shot || 'Medium');
            sheet.getRange(row, 4).setValue(act.description || '');
            sheet.getRange(row, 5).setValue('Draft');
            sheet.getRange(row, 1, 1, 5).setBackground(actColors[actLetter] || COLORS.GRAY);
            row++;
          });
        }
      });
    }
  });
}

/**
 * Show summary - Indonesian
 */
function showSummaryIndonesian(stats, duration, projectName, genre, style) {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: 'Segoe UI', Arial; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); }
      .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
      h2 { color: #1a73e8; margin-top: 0; }
      .success { color: #34a853; font-size: 28px; margin-bottom: 8px; }
      .info { background: #e8f0fe; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .stat { background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center; }
      .stat-val { font-size: 24px; font-weight: bold; color: #1a73e8; }
      .stat-label { font-size: 11px; color: #666; }
      .next { background: #e8f5e9; padding: 16px; border-radius: 12px; margin-top: 16px; }
      .next h3 { margin: 0 0 12px 0; font-size: 14px; color: #2e7d32; }
      .next ol { margin: 0; padding-left: 20px; font-size: 13px; }
      button { margin-top: 20px; padding: 14px 32px; background: #1a73e8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%; }
    </style>
    <div class="card">
      <div class="success">✅ Berhasil!</div>
      <h2>Generation Selesai</h2>
      <div class="info">
        <strong>${projectName}</strong><br>
        <small>Genre: ${genre} | Style: ${style}</small>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-val">${stats.chars}</div><div class="stat-label">Karakter</div></div>
        <div class="stat"><div class="stat-val">${stats.eps}</div><div class="stat-label">Episode</div></div>
        <div class="stat"><div class="stat-val">${stats.scenes}</div><div class="stat-label">Scene</div></div>
        <div class="stat"><div class="stat-val">${stats.acts}</div><div class="stat-label">Act</div></div>
        <div class="stat"><div class="stat-val">${stats.prompts}</div><div class="stat-label">Prompts</div></div>
        <div class="stat"><div class="stat-val">${duration}s</div><div class="stat-label">Waktu</div></div>
      </div>
      <div class="next">
        <h3>📋 Langkah Selanjutnya:</h3>
        <ol>
          <li>Review <b>Characters</b> - copy Character Prompt ke AI</li>
          <li>Review <b>Story</b> - edit adegan jika perlu</li>
          <li>Copy <b>Prompts</b> dari kolom J-K ke AI tools</li>
          <li>Lihat <b>Assets</b> untuk semua prompt lengkap</li>
        </ol>
      </div>
      <button onclick="google.script.host.close()">Tutup</button>
    </div>
  `).setWidth(400).setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, '🎬 Hasil Generate');
}
