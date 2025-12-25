/**
 * Generator.gs - Main Generation Logic V6
 * MAJOR IMPROVEMENTS:
 * - Smart character extraction (PEOPLE only, not locations!)
 * - All output in Bahasa Indonesia
 * - Detailed prompts for Image & Video generation
 * - Story table includes prompt columns
 * - Very detailed act descriptions
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
    '• Karakter + Image/Video Prompts\n\n' +
    'Semua output dalam Bahasa Indonesia.\n' +
    'Waktu: 5-10 menit. Lanjutkan?',
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
    
    Utilities.sleep(2000);
    
    // ========== BATCH 2: Extract REAL Character Names (SMART!) ==========
    toast('🔄 Batch 2/6: Mencari karakter (bukan lokasi!)...', '🎬', 30);
    
    const charNames = extractSmartCharacters(synopsis, basicInfo);
    Logger.log('Character names: ' + JSON.stringify(charNames));
    
    if (charNames.length === 0) {
      throw new Error('Tidak ada karakter ditemukan.');
    }
    
    Utilities.sleep(2000);
    
    // ========== BATCH 3: Get Character Details ==========
    toast('🔄 Batch 3/6: Membuat detail karakter...', '🎬', 60);
    
    const characters = [];
    for (let i = 0; i < Math.min(charNames.length, 6); i++) {
      toast(`🔄 Karakter ${i+1}/${Math.min(charNames.length, 6)}: ${charNames[i]}...`, '🎬', 20);
      
      const charDetail = getCharacterDetailSmart(charNames[i], synopsis, i, basicInfo);
      characters.push(charDetail);
      
      Utilities.sleep(2000);
    }
    
    writeCharacters(characters);
    stats.chars = characters.length;
    
    Utilities.sleep(2000);
    
    // ========== BATCH 4: Generate Episodes (Indonesian) ==========
    toast('🔄 Batch 4/6: Membuat episode...', '🎬', 60);
    
    const episodes = [];
    for (let i = 1; i <= settings.episodes; i++) {
      toast(`🔄 Episode ${i}/${settings.episodes}...`, '🎬', 20);
      
      const ep = generateEpisodeDetailedIndonesian(i, settings.episodes, synopsis, characters, basicInfo);
      episodes.push(ep);
      
      Utilities.sleep(2000);
    }
    
    stats.eps = episodes.length;
    
    Utilities.sleep(2000);
    
    // ========== BATCH 5: Generate Scenes with DETAILED Prompts ==========
    toast('🔄 Batch 5/6: Membuat scene & prompts detail...', '🎬', 120);
    
    for (let i = 0; i < episodes.length; i++) {
      const ep = episodes[i];
      ep.scenes = [];
      
      for (let j = 1; j <= settings.scenesPerEp; j++) {
        toast(`🔄 Episode ${i+1}, Scene ${j}/${settings.scenesPerEp}...`, '🎬', 20);
        
        const scene = generateSceneWithDetailedPrompts(ep, j, settings.scenesPerEp, characters, basicInfo);
        ep.scenes.push(scene);
        stats.scenes++;
        stats.acts += 4;
        stats.prompts += 8; // 4 image + 4 video prompts
        
        Utilities.sleep(2500);
      }
    }
    
    // Write to Story sheet (with prompts!)
    writeEpisodesWithPrompts(episodes);
    
    // ========== BATCH 6: Write Assets ==========
    toast('🔄 Batch 6/6: Menyimpan assets...', '🎬', 30);
    writeAssetsFromEpisodes(episodes, characters, basicInfo.style);
    
    const duration = Math.round((new Date() - startTime) / 1000);
    
    showSummaryIndonesian(stats, duration, basicInfo.projectName, basicInfo.genre, basicInfo.style);
    
  } catch (e) {
    Logger.log('Error: ' + e.message);
    alert('❌ Error\n\n' + e.message);
  }
}

/**
 * BATCH 1: Analyze basic info - Indonesian output with context
 */
function analyzeBasicInfoIndonesian(synopsis) {
  const shortSynopsis = synopsis.substring(0, 500);
  
  const prompt = `Analisis cerita berikut dengan cermat:

"${shortSynopsis}"

Tentukan:
1. Genre yang paling cocok
2. Style visual yang sesuai
3. Judul project dalam Bahasa Indonesia (2-5 kata, menarik)
4. Setting utama (lokasi cerita)
5. Tema utama cerita

Jawab dalam JSON saja:
{
"genre":"Drama",
"style":"Cinematic",
"projectName":"Judul Menarik",
"setting":"Pesantren di Ciamis",
"theme":"Perjalanan spiritual santri"
}

Pilihan genre: Drama, Action, Comedy, Horror, Romance, Thriller, Documentary
Pilihan style: Cinematic, Anime, Realistic, Cartoon`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.genre) {
      return parsed;
    }
  }
  
  // Smart fallback based on synopsis content
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
      setting: 'Pondok Pesantren',
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
  } else if (lower.includes('misteri') || lower.includes('hantu')) {
    return {
      genre: 'Horror',
      style: 'Cinematic',
      projectName: 'Misteri Malam',
      setting: 'Indonesia',
      theme: 'Misteri'
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
 * BATCH 2: Extract SMART characters - understands context!
 */
function extractSmartCharacters(synopsis, basicInfo) {
  const shortSynopsis = synopsis.substring(0, 800);
  const setting = basicInfo.setting || '';
  const theme = basicInfo.theme || '';
  
  const prompt = `Baca cerita ini dengan SANGAT CERMAT:

"${shortSynopsis}"

Setting: ${setting}
Tema: ${theme}

TUGAS: Identifikasi KARAKTER (ORANG) dalam cerita ini.

ATURAN PENTING:
1. Karakter = ORANG/MANUSIA yang berperan dalam cerita
2. BUKAN lokasi (Ciamis, Jawa, Pesantren = BUKAN karakter!)
3. BUKAN institusi (Pondok Darussalam = BUKAN karakter!)
4. Jika cerita menyebut "santri" tanpa nama, buat nama: "Ahmad" atau "Santri Ahmad"
5. Jika cerita menyebut "kyai" tanpa nama, buat nama: "Kyai Hasan"
6. Jika cerita menyebut "ustadz", buat nama: "Ustadz Mahmud"
7. Jika cerita menyebut "orang tua", buat nama: "Pak Hadi" dan "Bu Siti"

Contoh BENAR: Ahmad, Siti, Kyai Hasan, Ustadz Mahmud, Bu Nyai, Pak Hadi
Contoh SALAH: Pondok, Pesantren, Darussalam, Ciamis, Jawa, Indonesia

Berikan 4-6 nama karakter yang MASUK AKAL untuk cerita ini.
Jawab dalam JSON array saja:
["Nama 1", "Nama 2", "Nama 3", "Nama 4"]`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      // Double filter - remove any location names that slipped through
      const filtered = parsed.filter(name => !isDefinitelyLocation(name));
      if (filtered.length >= 2) {
        return filtered.slice(0, 6);
      }
    }
  }
  
  // Smart fallback based on context
  return createSmartCharacterNames(synopsis, basicInfo);
}

/**
 * Check if name is DEFINITELY a location (strict check)
 */
function isDefinitelyLocation(name) {
  if (!name || typeof name !== 'string') return true;
  
  const nameLower = name.toLowerCase().trim();
  
  // Exact matches - definitely locations
  const exactLocations = [
    'pondok', 'pesantren', 'darussalam', 'ciamis', 'jawa', 'barat', 'timur',
    'utara', 'selatan', 'jakarta', 'bandung', 'surabaya', 'indonesia',
    'masjid', 'sekolah', 'universitas', 'kampus', 'desa', 'kota', 'kabupaten',
    'provinsi', 'kecamatan', 'kelurahan', 'aula', 'gedung', 'ruang'
  ];
  
  for (const loc of exactLocations) {
    if (nameLower === loc || nameLower.startsWith(loc + ' ') || nameLower.endsWith(' ' + loc)) {
      return true;
    }
  }
  
  // If name is just one word and matches location keyword
  if (!nameLower.includes(' ')) {
    for (const loc of exactLocations) {
      if (nameLower === loc) return true;
    }
  }
  
  // Names with "Pondok Pesantren" pattern
  if (nameLower.includes('pondok pesantren')) return true;
  
  return false;
}

/**
 * Create smart character names based on context
 */
function createSmartCharacterNames(synopsis, basicInfo) {
  const lower = synopsis.toLowerCase();
  const setting = (basicInfo.setting || '').toLowerCase();
  
  // Pesantren/Islamic context
  if (lower.includes('santri') || lower.includes('pesantren') || lower.includes('kyai') || setting.includes('pesantren')) {
    return [
      'Ahmad Fauzi',      // Santri utama
      'Siti Aisyah',      // Santriwati
      'Kyai Hasan',       // Pengasuh pesantren
      'Ustadz Mahmud',    // Guru ngaji
      'Bu Nyai Fatimah',  // Istri kyai
      'Pak Hadi'          // Orang tua santri
    ];
  }
  
  // School context
  if (lower.includes('sekolah') || lower.includes('siswa') || lower.includes('guru')) {
    return [
      'Budi Santoso',
      'Ani Wijaya',
      'Pak Guru Hendra',
      'Bu Guru Sari',
      'Doni Pratama'
    ];
  }
  
  // Office/work context
  if (lower.includes('kantor') || lower.includes('kerja') || lower.includes('perusahaan')) {
    return [
      'Andi Pratama',
      'Dewi Lestari',
      'Pak Bambang',
      'Bu Rina',
      'Dimas Wijaya'
    ];
  }
  
  // Family context
  if (lower.includes('keluarga') || lower.includes('ayah') || lower.includes('ibu')) {
    return [
      'Pak Hadi',
      'Bu Siti',
      'Andi',
      'Sari',
      'Nenek Aminah'
    ];
  }
  
  // Default Indonesian names
  return [
    'Andi Pratama',
    'Sari Dewi',
    'Budi Santoso',
    'Ani Wijaya'
  ];
}

/**
 * BATCH 3: Get character detail - VERY DETAILED for AI image generation
 */
function getCharacterDetailSmart(name, synopsis, index, basicInfo) {
  const shortSynopsis = synopsis.substring(0, 400);
  const roles = ['Protagonist', 'Supporting', 'Supporting', 'Supporting', 'Minor', 'Minor'];
  const defaultRole = roles[index] || 'Supporting';
  const setting = basicInfo.setting || '';
  
  const prompt = `Karakter "${name}" dalam cerita:
"${shortSynopsis}"

Setting: ${setting}

Buat deskripsi SANGAT DETAIL untuk karakter ini agar AI image generator bisa membuat gambar yang KONSISTEN.

PENTING - Deskripsi appearance harus mencakup:
- Warna kulit (sawo matang/kuning langsat/putih/coklat)
- Warna dan gaya rambut (hitam pendek rapi/hitam panjang lurus/berjilbab putih/dll)
- Bentuk wajah (oval/bulat/persegi/lonjong)
- Ciri khas (berkacamata/berjenggot/berkumis/berpeci/dll)
- Pakaian khas (jubah putih/baju koko/gamis/seragam/dll)
- Usia terlihat (muda/paruh baya/tua)

Jawab dalam JSON saja:
{
"name":"${name}",
"role":"${defaultRole}",
"age":"usia dalam angka",
"gender":"Male atau Female",
"appearance":"DESKRIPSI SANGAT DETAIL 50-80 kata tentang penampilan fisik",
"personality":"sifat-sifat utama karakter dalam Bahasa Indonesia"
}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.name) {
      parsed.role = validateRole(parsed.role || defaultRole);
      parsed.gender = validateGender(parsed.gender);
      // Ensure appearance is detailed enough
      if (!parsed.appearance || parsed.appearance.length < 30) {
        parsed.appearance = createDetailedAppearance(name, parsed.gender, parsed.age, basicInfo);
      }
      return parsed;
    }
  }
  
  // Smart fallback with detailed appearance
  return createSmartCharacterFallback(name, index, basicInfo);
}

/**
 * Create detailed appearance description
 */
function createDetailedAppearance(name, gender, age, basicInfo) {
  const setting = (basicInfo.setting || '').toLowerCase();
  const ageNum = parseInt(age) || 25;
  
  // Pesantren context
  if (setting.includes('pesantren') || name.toLowerCase().includes('kyai') || name.toLowerCase().includes('ustadz')) {
    if (gender === 'Female') {
      return 'Wanita Indonesia berkulit sawo matang, wajah oval teduh, mengenakan jilbab putih bersih yang menutupi rambut, gamis panjang warna pastel, ekspresi wajah lembut dan bijaksana, mata hitam yang hangat, senyum ramah';
    } else if (name.toLowerCase().includes('kyai') || ageNum > 50) {
      return 'Pria Indonesia paruh baya berkulit sawo matang, wajah bijaksana dengan jenggot putih lebat, mengenakan peci hitam dan jubah putih bersih, sorban di pundak, mata teduh penuh kebijaksanaan, postur tegap berwibawa';
    } else if (name.toLowerCase().includes('ustadz')) {
      return 'Pria Indonesia dewasa berkulit sawo matang, wajah ramah dengan jenggot hitam rapi, mengenakan peci putih dan baju koko putih bersih, sarung batik, mata hangat, senyum bijaksana';
    } else {
      return 'Pemuda Indonesia berkulit sawo matang, rambut hitam pendek rapi, wajah bersih dan cerah, mengenakan peci putih dan baju koko putih, sarung hijau, ekspresi wajah polos dan penuh semangat, postur tubuh sedang';
    }
  }
  
  // Default Indonesian appearance
  if (gender === 'Female') {
    return 'Wanita Indonesia muda berkulit kuning langsat, rambut hitam panjang lurus, wajah oval dengan mata hitam berbinar, hidung mancung, bibir tipis, mengenakan pakaian sopan warna cerah, ekspresi ramah dan ceria';
  } else {
    return 'Pria Indonesia muda berkulit sawo matang, rambut hitam pendek rapi, wajah persegi dengan rahang tegas, mata hitam tajam, alis tebal, mengenakan kemeja rapi, postur tubuh atletis sedang, ekspresi percaya diri';
  }
}

/**
 * Create smart character fallback with full details
 */
function createSmartCharacterFallback(name, index, basicInfo) {
  const setting = (basicInfo.setting || '').toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Determine gender from name
  let gender = 'Male';
  if (nameLower.includes('siti') || nameLower.includes('aisyah') || nameLower.includes('fatimah') || 
      nameLower.includes('ani') || nameLower.includes('dewi') || nameLower.includes('sari') ||
      nameLower.includes('bu ') || nameLower.includes('nyai')) {
    gender = 'Female';
  }
  
  // Determine age from name/role
  let age = '22';
  if (nameLower.includes('kyai') || nameLower.includes('pak ') || nameLower.includes('bu ')) {
    age = '55';
  } else if (nameLower.includes('ustadz') || nameLower.includes('ustadzah')) {
    age = '35';
  }
  
  // Determine role
  let role = 'Supporting';
  if (index === 0) role = 'Protagonist';
  if (nameLower.includes('kyai')) role = 'Supporting';
  
  return {
    name: name,
    role: role,
    age: age,
    gender: gender,
    appearance: createDetailedAppearance(name, gender, age, basicInfo),
    personality: 'Baik hati, sopan, bertanggung jawab, dan penuh semangat'
  };
}

/**
 * Validate role for dropdown
 */
function validateRole(role) {
  const validRoles = ['Protagonist', 'Antagonist', 'Supporting', 'Minor'];
  const roleLower = (role || '').toLowerCase();
  
  if (roleLower.includes('protag') || roleLower.includes('utama')) return 'Protagonist';
  if (roleLower.includes('antag') || roleLower.includes('jahat')) return 'Antagonist';
  if (roleLower.includes('minor') || roleLower.includes('kecil')) return 'Minor';
  if (validRoles.includes(role)) return role;
  return 'Supporting';
}

/**
 * Validate gender for dropdown
 */
function validateGender(gender) {
  const genderLower = (gender || '').toLowerCase();
  if (genderLower.includes('female') || genderLower.includes('perempuan') || genderLower.includes('wanita')) return 'Female';
  if (genderLower.includes('non')) return 'Non-binary';
  return 'Male';
}

/**
 * BATCH 4: Generate episode - Indonesian, VERY detailed
 */
function generateEpisodeDetailedIndonesian(epNumber, totalEps, synopsis, characters, basicInfo) {
  const charNames = characters.slice(0, 3).map(c => c.name).join(', ');
  const shortSynopsis = synopsis.substring(0, 400);
  const setting = basicInfo.setting || '';
  const theme = basicInfo.theme || '';
  
  // Determine episode focus based on position
  let episodeFocus = '';
  if (totalEps === 1) {
    episodeFocus = 'Cerita lengkap dari awal hingga akhir';
  } else if (epNumber === 1) {
    episodeFocus = 'Perkenalan karakter dan setting, awal konflik';
  } else if (epNumber === totalEps) {
    episodeFocus = 'Klimaks dan resolusi cerita';
  } else if (epNumber <= totalEps / 2) {
    episodeFocus = 'Pengembangan konflik dan karakter';
  } else {
    episodeFocus = 'Menuju klimaks, ketegangan meningkat';
  }
  
  const prompt = `Cerita: "${shortSynopsis}"

Setting: ${setting}
Tema: ${theme}
Karakter: ${charNames}

Buat Episode ${epNumber} dari ${totalEps} episode.
Fokus episode ini: ${episodeFocus}

Buat judul dan ringkasan dalam Bahasa Indonesia yang SANGAT DETAIL.
Ringkasan harus 3-4 kalimat, menjelaskan:
- Apa yang terjadi di episode ini
- Karakter mana yang terlibat
- Konflik atau momen penting
- Bagaimana episode berakhir

Jawab dalam JSON saja:
{
"number":${epNumber},
"title":"Judul Episode dalam Bahasa Indonesia (menarik dan deskriptif)",
"summary":"Ringkasan SANGAT DETAIL 3-4 kalimat"
}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.title) {
      parsed.number = epNumber;
      return parsed;
    }
  }
  
  // Smart fallback based on episode position
  return createEpisodeFallback(epNumber, totalEps, characters, basicInfo);
}

/**
 * Create episode fallback with context
 */
function createEpisodeFallback(epNumber, totalEps, characters, basicInfo) {
  const setting = (basicInfo.setting || '').toLowerCase();
  const charName = characters[0]?.name || 'Karakter Utama';
  
  // Pesantren context
  if (setting.includes('pesantren')) {
    const titles = [
      'Langkah Pertama di Gerbang Pesantren',
      'Hari-Hari Penuh Perjuangan',
      'Ujian yang Menguatkan',
      'Wisuda Penuh Haru'
    ];
    const summaries = [
      `${charName} pertama kali menginjakkan kaki di pesantren dengan perasaan campur aduk. Suasana baru, teman-teman baru, dan rutinitas yang berbeda dari rumah. Episode ini menampilkan adaptasi awal dan perkenalan dengan kehidupan pesantren.`,
      `Keseharian di pesantren mulai terasa: bangun subuh, sholat berjamaah, mengaji, dan belajar kitab kuning. ${charName} menghadapi berbagai tantangan namun mulai menemukan makna dalam setiap kegiatan.`,
      `Ujian besar menanti para santri. ${charName} harus membuktikan hasil belajarnya selama ini. Momen-momen tegang bercampur dengan dukungan dari teman-teman dan para ustadz.`,
      `Hari wisuda yang dinanti tiba. ${charName} dan teman-teman menerima ijazah dengan penuh haru. Air mata kebahagiaan mengalir, kenangan indah terukir untuk selamanya.`
    ];
    
    return {
      number: epNumber,
      title: titles[Math.min(epNumber - 1, titles.length - 1)] || 'Episode ' + epNumber,
      summary: summaries[Math.min(epNumber - 1, summaries.length - 1)] || 'Episode ' + epNumber + ' dari cerita ini.'
    };
  }
  
  // Default fallback
  const defaultTitles = ['Awal Perjalanan', 'Tantangan Pertama', 'Konflik Memuncak', 'Titik Balik', 'Klimaks', 'Resolusi'];
  return {
    number: epNumber,
    title: defaultTitles[Math.min(epNumber - 1, defaultTitles.length - 1)] || 'Episode ' + epNumber,
    summary: `Episode ${epNumber} menampilkan perkembangan cerita ${charName}. Berbagai peristiwa penting terjadi yang membawa cerita ke tahap selanjutnya.`
  };
}

/**
 * BATCH 5: Generate scene with VERY DETAILED Prompts - Indonesian
 */
function generateSceneWithDetailedPrompts(episode, sceneNumber, totalScenes, characters, basicInfo) {
  const charName = characters[0]?.name || 'Karakter Utama';
  const charAppearance = characters[0]?.appearance || 'kulit sawo matang, rambut hitam';
  const setting = basicInfo.setting || '';
  const style = basicInfo.style || 'Cinematic';
  
  // Determine scene position and focus
  let sceneFocus = '';
  if (sceneNumber === 1) {
    sceneFocus = 'Opening scene - perkenalan setting dan suasana';
  } else if (sceneNumber === totalScenes) {
    sceneFocus = 'Closing scene - resolusi dan penutup episode';
  } else if (sceneNumber <= totalScenes / 2) {
    sceneFocus = 'Development - pengembangan cerita';
  } else {
    sceneFocus = 'Rising action - menuju klimaks';
  }
  
  const prompt = `Episode: "${episode.title}"
Scene ${sceneNumber} dari ${totalScenes}.
Fokus: ${sceneFocus}
Setting: ${setting}
Karakter utama: ${charName}

Buat scene dengan 4 act yang SANGAT DETAIL dalam Bahasa Indonesia.

PENTING - Setiap act description harus:
- Minimal 2-3 kalimat PANJANG
- Menjelaskan VISUAL dengan detail (apa yang terlihat di layar)
- Menjelaskan AKSI karakter (apa yang dilakukan)
- Menjelaskan EMOSI/SUASANA (bagaimana perasaan/atmosfer)
- Cocok untuk dijadikan prompt AI image/video generator

Jawab dalam JSON saja:
{
"number":${sceneNumber},
"title":"Judul Scene dalam Bahasa Indonesia",
"location":"Lokasi SPESIFIK dan DETAIL (contoh: Halaman depan pesantren dengan pohon beringin besar, pagar putih, dan jalan setapak berbatu)",
"timeOfDay":"Morning/Afternoon/Evening/Night",
"characters":["${charName}"],
"costumeNote":"Pakaian yang dikenakan karakter di scene ini",
"acts":[
{"act":"A","description":"DESKRIPSI SANGAT DETAIL 3-4 kalimat untuk ESTABLISHING SHOT. Jelaskan pemandangan luas, suasana lokasi, posisi karakter dari jauh, cuaca, pencahayaan, dan atmosfer keseluruhan.","shotType":"Wide","mood":"suasana emosional"},
{"act":"B","description":"DESKRIPSI SANGAT DETAIL 3-4 kalimat untuk DEVELOPMENT. Jelaskan karakter mulai beraksi, ekspresi wajah, gerakan tubuh, interaksi dengan lingkungan, detail pakaian yang terlihat.","shotType":"Medium","mood":"suasana"},
{"act":"C","description":"DESKRIPSI SANGAT DETAIL 3-4 kalimat untuk KLIMAKS SCENE. Momen paling intens/emosional, close-up wajah, detail ekspresi mata, air mata jika ada, gesture tangan, momen yang memorable.","shotType":"Close-up","mood":"suasana"},
{"act":"D","description":"DESKRIPSI SANGAT DETAIL 3-4 kalimat untuk RESOLUSI. Bagaimana scene berakhir, transisi ke scene berikutnya, karakter bergerak keluar frame atau perubahan suasana.","shotType":"Medium","mood":"suasana"}
]
}`;

  const response = generateText(prompt);
  
  if (response.success) {
    const parsed = parseJSON(response.data);
    if (parsed && parsed.acts && parsed.acts.length >= 4) {
      parsed.number = sceneNumber;
      
      // Generate DETAILED prompts for each act
      parsed.acts.forEach((act, i) => {
        act.imagePrompt = buildDetailedImagePrompt(act, parsed, characters, style);
        act.videoPrompt = buildDetailedVideoPrompt(act, parsed, characters);
      });
      
      return parsed;
    }
  }
  
  // Fallback with detailed prompts
  return createDetailedFallbackScene(episode, sceneNumber, characters, basicInfo);
}

/**
 * Build VERY DETAILED image prompt from act
 */
function buildDetailedImagePrompt(act, scene, characters, style) {
  const parts = [];
  
  // 1. Shot type with detail
  const shotDetails = {
    'Wide': 'Cinematic wide establishing shot, full environment visible, characters small in frame',
    'Medium': 'Medium shot framing character from waist up, balanced composition',
    'Close-up': 'Intimate close-up shot focusing on face and expression, shallow depth of field',
    'Extreme Close-up': 'Extreme close-up macro shot, intense detail on eyes or specific feature'
  };
  parts.push(shotDetails[act.shotType] || 'Medium shot');
  
  // 2. Characters with FULL appearance
  if (scene.characters && scene.characters.length > 0) {
    scene.characters.forEach(charName => {
      const char = characters.find(c => c.name === charName);
      if (char && char.appearance) {
        parts.push(`${char.name}: ${char.appearance}`);
        
        // Add costume if specified
        if (scene.costumeNote) {
          parts.push(`wearing ${scene.costumeNote}`);
        }
      }
    });
  }
  
  // 3. Location with atmosphere
  if (scene.location) {
    parts.push(`Location: ${scene.location}`);
  }
  
  // 4. Action/Description (the main content)
  if (act.description) {
    parts.push(`Scene: ${act.description}`);
  }
  
  // 5. Time of day with lighting details
  const lightingDetails = {
    'Morning': 'Golden hour morning light, soft warm sunbeams, gentle shadows, peaceful atmosphere',
    'Afternoon': 'Bright natural daylight, clear visibility, vibrant colors, energetic mood',
    'Evening': 'Warm sunset golden hour, orange and pink sky, long dramatic shadows, nostalgic feeling',
    'Night': 'Night scene with dramatic moonlight, deep shadows, mysterious atmosphere, cool blue tones'
  };
  parts.push(lightingDetails[scene.timeOfDay] || 'Natural lighting');
  
  // 6. Mood/Atmosphere
  if (act.mood) {
    parts.push(`Mood: ${act.mood}, emotional atmosphere`);
  }
  
  // 7. Style with technical details
  const styleDetails = {
    'Cinematic': 'Cinematic film look, 35mm film grain, shallow depth of field, professional color grading, anamorphic lens flare, movie quality production',
    'Anime': 'High quality anime style, vibrant saturated colors, detailed cel shading, expressive eyes, dynamic composition, Studio Ghibli inspired',
    'Realistic': 'Photorealistic rendering, 8K ultra HD quality, natural skin texture, accurate lighting, lifelike details, professional photography',
    'Cartoon': 'Stylized cartoon aesthetic, bold outlines, bright cheerful colors, exaggerated expressions, family-friendly animation style'
  };
  parts.push(styleDetails[style] || styleDetails['Cinematic']);
  
  // 8. Technical quality tags
  parts.push('masterpiece, best quality, highly detailed, sharp focus');
  
  return parts.join('. ') + '.';
}

/**
 * Build VERY DETAILED video prompt from act
 */
function buildDetailedVideoPrompt(act, scene, characters) {
  const parts = [];
  
  // 1. Shot type
  parts.push(`${act.shotType} shot`);
  
  // 2. Subject
  if (scene.characters && scene.characters.length > 0) {
    const charDescs = scene.characters.slice(0, 2).map(charName => {
      const char = characters.find(c => c.name === charName);
      if (char) {
        return `${char.name} (${char.appearance?.substring(0, 50) || 'Indonesian person'})`;
      }
      return charName;
    });
    parts.push(`featuring ${charDescs.join(' and ')}`);
  }
  
  // 3. Location
  if (scene.location) {
    parts.push(`in ${scene.location}`);
  }
  
  // 4. Action (main content)
  if (act.description) {
    parts.push(act.description);
  }
  
  // 5. Camera movement based on act
  const cameraMovements = {
    'A': 'Camera slowly pushes in from wide to establish the scene, smooth dolly movement',
    'B': 'Camera tracks alongside character movement, steady follow shot',
    'C': 'Camera holds steady on emotional moment, subtle breathing movement',
    'D': 'Camera slowly pulls back to close the scene, graceful retreat'
  };
  parts.push(cameraMovements[act.act] || 'Smooth camera movement');
  
  // 6. Lighting
  const time = scene.timeOfDay || 'Day';
  parts.push(`${time.toLowerCase()} lighting conditions`);
  
  // 7. Duration and quality
  parts.push('Duration: 8 seconds');
  parts.push('Cinematic quality, smooth 24fps motion, professional production value, no artifacts');
  
  return parts.join('. ') + '.';
}

/**
 * Create detailed fallback scene with prompts
 */
function createDetailedFallbackScene(episode, sceneNumber, characters, basicInfo) {
  const charName = characters[0]?.name || 'Karakter';
  const charAppearance = characters[0]?.appearance || 'kulit sawo matang, rambut hitam pendek rapi';
  const setting = (basicInfo.setting || '').toLowerCase();
  const style = basicInfo.style || 'Cinematic';
  
  // Context-aware locations
  let locations, costumeNote;
  if (setting.includes('pesantren')) {
    locations = [
      'Gerbang utama pesantren dengan arsitektur tradisional Jawa, pagar putih tinggi, pohon beringin rindang di samping',
      'Aula utama pesantren dengan lantai marmer, jendela besar, kaligrafi Arab di dinding',
      'Halaman pesantren yang luas dengan rumput hijau, santri-santri berlalu lalang',
      'Masjid pesantren dengan kubah hijau, menara tinggi, suasana khusyuk',
      'Asrama santri dengan tempat tidur tingkat, lemari kayu, jendela terbuka'
    ];
    costumeNote = 'Baju koko putih bersih, peci putih, sarung hijau';
  } else {
    locations = [
      'Ruang tamu rumah Indonesia dengan sofa batik, foto keluarga di dinding',
      'Taman kota dengan bangku kayu, pohon rindang, lampu taman',
      'Jalan kampung dengan rumah-rumah tradisional, anak-anak bermain',
      'Kantor modern dengan meja kerja, komputer, tanaman hias'
    ];
    costumeNote = 'Pakaian kasual rapi';
  }
  
  const location = locations[(sceneNumber - 1) % locations.length];
  const times = ['Morning', 'Morning', 'Afternoon', 'Evening', 'Night'];
  const timeOfDay = times[(sceneNumber - 1) % times.length];
  
  const scene = {
    number: sceneNumber,
    title: `Scene ${sceneNumber}: ${episode.title}`,
    location: location,
    timeOfDay: timeOfDay,
    characters: [charName],
    costumeNote: costumeNote,
    acts: [
      {
        act: 'A',
        description: `Pemandangan luas ${location}. Cahaya ${timeOfDay === 'Morning' ? 'pagi yang lembut' : timeOfDay === 'Evening' ? 'senja keemasan' : 'alami'} menerangi seluruh area. ${charName} terlihat dari kejauhan, berdiri dengan postur tegak. Suasana tenang dan damai menyelimuti, angin sepoi-sepoi menggerakkan dedaunan. Burung-burung berkicau di kejauhan menambah kesan natural.`,
        shotType: 'Wide',
        mood: 'tenang dan damai'
      },
      {
        act: 'B',
        description: `${charName} mulai berjalan perlahan dengan langkah mantap. Wajahnya terlihat jelas - ${charAppearance}. Ekspresi wajahnya menunjukkan campuran harapan dan sedikit kegugupan. Tangannya bergerak natural di samping tubuh. Detail pakaiannya terlihat rapi dan bersih. Latar belakang sedikit blur mengarahkan fokus pada karakter.`,
        shotType: 'Medium',
        mood: 'penuh harapan'
      },
      {
        act: 'C',
        description: `Close-up wajah ${charName}. Matanya yang hitam berbinar penuh emosi, terlihat sedikit berkaca-kaca. Bibirnya sedikit bergetar menahan perasaan. Setiap detail wajahnya terlihat - kerutan halus di dahi menunjukkan konsentrasi, pipinya sedikit memerah. Ini adalah momen paling intens dan emosional dari scene ini. Pencahayaan dramatis memperkuat mood.`,
        shotType: 'Close-up',
        mood: 'emosional dan intens'
      },
      {
        act: 'D',
        description: `${charName} menarik napas dalam-dalam, kemudian mengangguk pelan dengan penuh keyakinan. Senyum tipis mulai terbentuk di wajahnya. Perlahan ia berbalik dan mulai berjalan menjauh dari kamera. Sosoknya semakin mengecil di frame. Scene berakhir dengan suasana penuh harapan untuk apa yang akan datang.`,
        shotType: 'Medium',
        mood: 'penuh harapan dan resolusi'
      }
    ]
  };
  
  // Add detailed prompts
  scene.acts.forEach(act => {
    act.imagePrompt = buildDetailedImagePrompt(act, scene, characters, style);
    act.videoPrompt = buildDetailedVideoPrompt(act, scene, characters);
  });
  
  return scene;
}

/**
 * Write assets from episodes to Assets sheet
 */
function writeAssetsFromEpisodes(episodes, characters, style) {
  let assetId = 1;
  
  episodes.forEach(ep => {
    if (ep.scenes) {
      ep.scenes.forEach(scene => {
        if (scene.acts) {
          scene.acts.forEach((act, ai) => {
            const actLetter = act.act || ['A','B','C','D'][ai];
            
            // Get seed from main character for consistency
            const mainChar = characters.find(c => 
              scene.characters && scene.characters.includes(c.name)
            );
            const seed = mainChar?.seed || getSeed(`${ep.number}-${scene.number}-${actLetter}`);
            
            // Generate preview image
            let imageUrl = '';
            try {
              imageUrl = generateImage(act.imagePrompt || '', { seed: seed, width: 1280, height: 720 });
            } catch (e) {
              Logger.log('Image generation error: ' + e.message);
            }
            
            addAsset({
              id: assetId++,
              scene: ep.number + '.' + scene.number,
              act: actLetter,
              description: act.description || '',
              imagePrompt: act.imagePrompt || '',
              videoPrompt: act.videoPrompt || '',
              imageUrl: imageUrl,
              status: imageUrl ? 'Generated' : 'Pending',
              duration: '8s'
            });
          });
        }
      });
    }
  });
}

/**
 * Write episodes with prompts to Story sheet
 */
function writeEpisodesWithPrompts(episodes) {
  const sheet = getStorySheet();
  if (!sheet) return;
  
  let row = STORY.DATA_START_ROW;
  
  episodes.forEach(ep => {
    // Episode row
    sheet.getRange(row, 1).setValue(ep.number);
    sheet.getRange(row, 2).setValue('EPISODE');
    sheet.getRange(row, 3).setValue(ep.title);
    sheet.getRange(row, 1, 1, 9).setBackground(COLORS.LIGHT_BLUE).setFontWeight('bold');
    row++;
    
    if (ep.scenes) {
      ep.scenes.forEach(scene => {
        // Scene row
        sheet.getRange(row, 1).setValue(ep.number + '.' + scene.number);
        sheet.getRange(row, 2).setValue('SCENE');
        sheet.getRange(row, 3).setValue(scene.title || 'Scene ' + scene.number);
        sheet.getRange(row, 4).setValue(scene.location || '');
        sheet.getRange(row, 5).setValue(scene.timeOfDay || 'Day');
        sheet.getRange(row, 6).setValue((scene.characters || []).join(', '));
        sheet.getRange(row, 7).setValue(scene.costumeNote || '');
        sheet.getRange(row, 9).setValue('Draft');
        sheet.getRange(row, 1, 1, 9).setBackground(COLORS.LIGHT_GREEN);
        row++;
        
        // Act rows with prompts
        if (scene.acts) {
          scene.acts.forEach((act, ai) => {
            const actLetter = act.act || ['A','B','C','D'][ai];
            const actColors = { 'A': COLORS.ACT_A, 'B': COLORS.ACT_B, 'C': COLORS.ACT_C, 'D': COLORS.ACT_D };
            
            sheet.getRange(row, 1).setValue(ep.number + '.' + scene.number + actLetter);
            sheet.getRange(row, 2).setValue('Act ' + actLetter);
            sheet.getRange(row, 3).setValue(act.description || '');
            sheet.getRange(row, 4).setValue(scene.location || '');
            sheet.getRange(row, 5).setValue(scene.timeOfDay || 'Day');
            sheet.getRange(row, 6).setValue((scene.characters || []).join(', '));
            sheet.getRange(row, 7).setValue(scene.costumeNote || '');
            sheet.getRange(row, 8).setValue(act.shotType || 'Medium');
            sheet.getRange(row, 9).setValue('Draft');
            
            // Color code by act
            sheet.getRange(row, 1, 1, 9).setBackground(actColors[actLetter] || COLORS.GRAY);
            
            row++;
          });
        }
      });
    }
  });
}

/**
 * Show generation summary - Indonesian
 */
function showSummaryIndonesian(stats, duration, projectName, genre, style) {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
      .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
      h2 { color: #1a73e8; margin-top: 0; font-size: 24px; }
      .success { color: #34a853; font-size: 28px; margin-bottom: 8px; }
      .info { background: linear-gradient(135deg, #e8f0fe 0%, #f3e5f5 100%); padding: 16px; border-radius: 12px; margin-bottom: 20px; }
      .info strong { font-size: 18px; color: #333; }
      .info small { color: #666; display: block; margin-top: 4px; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
      .stat { background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center; }
      .stat-icon { font-size: 24px; }
      .stat-val { font-size: 28px; font-weight: bold; color: #1a73e8; }
      .stat-label { font-size: 12px; color: #666; }
      .next { background: #e8f5e9; padding: 16px; border-radius: 12px; margin-top: 16px; }
      .next h3 { margin: 0 0 12px 0; font-size: 14px; color: #2e7d32; }
      .next ol { margin: 0; padding-left: 20px; }
      .next li { margin: 6px 0; font-size: 13px; color: #333; }
      button { margin-top: 20px; padding: 14px 32px; background: linear-gradient(135deg, #1a73e8 0%, #7c4dff 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; }
      button:hover { opacity: 0.9; }
    </style>
    <div class="card">
      <div class="success">✅ Berhasil!</div>
      <h2>Generation Selesai</h2>
      
      <div class="info">
        <strong>${projectName}</strong>
        <small>Genre: ${genre} | Style: ${style}</small>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-icon">👥</div>
          <div class="stat-val">${stats.chars}</div>
          <div class="stat-label">Karakter</div>
        </div>
        <div class="stat">
          <div class="stat-icon">📺</div>
          <div class="stat-val">${stats.eps}</div>
          <div class="stat-label">Episode</div>
        </div>
        <div class="stat">
          <div class="stat-icon">🎬</div>
          <div class="stat-val">${stats.scenes}</div>
          <div class="stat-label">Scene</div>
        </div>
        <div class="stat">
          <div class="stat-icon">🎭</div>
          <div class="stat-val">${stats.acts}</div>
          <div class="stat-label">Act</div>
        </div>
        <div class="stat">
          <div class="stat-icon">🖼️</div>
          <div class="stat-val">${stats.prompts}</div>
          <div class="stat-label">Prompts</div>
        </div>
        <div class="stat">
          <div class="stat-icon">⏱️</div>
          <div class="stat-val">${duration}s</div>
          <div class="stat-label">Waktu</div>
        </div>
      </div>
      
      <div class="next">
        <h3>📋 Langkah Selanjutnya:</h3>
        <ol>
          <li>Review <strong>Karakter</strong> di tab 👥 Characters</li>
          <li>Review <strong>Cerita</strong> di tab 🎬 Story</li>
          <li>Copy <strong>Image/Video Prompts</strong> dari tab 🎨 Assets</li>
          <li>Paste prompts ke Midjourney, DALL-E, VEO, atau Runway</li>
        </ol>
      </div>
      
      <button onclick="google.script.host.close()">Tutup</button>
    </div>
  `).setWidth(400).setHeight(580);
  
  SpreadsheetApp.getUi().showModalDialog(html, '🎬 Hasil Generate');
}

