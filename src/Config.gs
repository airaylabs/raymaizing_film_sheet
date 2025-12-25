/**
 * Config.gs - Constants and Configuration V7
 * All sheet layouts and dropdown options
 * UPDATED: Added prompt columns, overview sheet, better structure
 */

// Sheet names
const SHEETS = {
  STORY: '🎬 Story',
  CHARACTERS: '👥 Characters',
  ASSETS: '🎨 Assets',
  OVERVIEW: '📊 Overview'
};

// Content type presets
const CONTENT_TYPES = {
  'Drama Series': { episodes: 4, scenes: 5, actDuration: 8 },
  'Mini Drama': { episodes: 12, scenes: 3, actDuration: 5 },
  'Film Movie': { episodes: 1, scenes: 15, actDuration: 10 },
  'Short Film': { episodes: 1, scenes: 6, actDuration: 8 },
  'Web Series': { episodes: 6, scenes: 4, actDuration: 6 },
  'TikTok/Reels': { episodes: 1, scenes: 1, actDuration: 4 },
  'YouTube Shorts': { episodes: 1, scenes: 2, actDuration: 5 },
  'Music Video': { episodes: 1, scenes: 8, actDuration: 6 }
};

// Dropdown options - EXPANDED
const OPTIONS = {
  contentType: Object.keys(CONTENT_TYPES),
  episodes: ['1','2','3','4','5','6','8','10','12','16','20','24'],
  scenes: ['1','2','3','4','5','6','8','10','12','15','20'],
  timeOfDay: ['Pagi', 'Siang', 'Sore', 'Malam', 'Subuh', 'Senja'],
  shotType: ['Wide', 'Medium', 'Close-up', 'Extreme Close-up', 'POV', 'Over-shoulder', 'Tracking', 'Aerial'],
  status: ['Draft', 'Review', 'Approved', 'Done'],
  charStatus: ['Baru', 'Ada Referensi', 'Selesai'],
  assetStatus: ['Pending', 'Generating', 'Generated', 'Error'],
  role: ['Protagonist', 'Antagonist', 'Supporting', 'Minor'],
  gender: ['Pria', 'Wanita', 'Lainnya'],
  actType: ['Act A', 'Act B', 'Act C', 'Act D']
};

// Story sheet layout - UPDATED with prompt columns
const STORY = {
  // Row positions
  HEADER_ROW: 1,
  CONTENT_TYPE_ROW: 2,
  SETTINGS_ROW: 3,
  AUTO_ROW: 4,
  INFO_ROW: 5,
  SYNOPSIS_HEADER_ROW: 6,
  SYNOPSIS_START_ROW: 7,
  SYNOPSIS_END_ROW: 10,
  TABLE_HEADER_ROW: 12,
  DATA_START_ROW: 13,
  
  // Cell positions
  CONTENT_TYPE: 'B2',
  EPISODES: 'B3',
  SCENES_PER_EP: 'D3',
  GENRE: 'B4',
  STYLE: 'D4',
  PROJECT_NAME: 'F4',
  SYNOPSIS: 'A7',
  
  // Column positions (1-indexed)
  COL: {
    ID: 1,           // A - #
    TYPE: 2,         // B - Type
    TITLE: 3,        // C - Title/Description
    LOCATION: 4,     // D - Location
    TIME: 5,         // E - Time
    CHARACTERS: 6,   // F - Characters
    COSTUME: 7,      // G - Costume
    SHOT: 8,         // H - Shot
    STATUS: 9,       // I - Status
    IMG_PROMPT: 10,  // J - Image Prompt (NEW)
    VID_PROMPT: 11,  // K - Video Prompt (NEW)
    NARRATION: 12    // L - Narration/Dialog (NEW)
  }
};

// Characters sheet layout
const CHARS = {
  HEADER_ROW: 1,
  INFO_ROW: 2,
  TABLE_HEADER_ROW: 3,
  DATA_START_ROW: 4,
  
  COL: {
    NAME: 1,
    ROLE: 2,
    AGE: 3,
    GENDER: 4,
    APPEARANCE: 5,
    SEED: 6,
    PERSONALITY: 7,
    REF_IMAGE: 8,
    STATUS: 9,
    CHAR_PROMPT: 10  // NEW - Character reference prompt
  }
};

// Assets sheet layout - UPDATED
const ASSETS = {
  HEADER_ROW: 1,
  INFO_ROW: 2,
  TABLE_HEADER_ROW: 3,
  DATA_START_ROW: 4,
  
  COL: {
    ID: 1,
    SCENE: 2,
    ACT: 3,
    DESCRIPTION: 4,
    PREVIEW: 5,
    TXT2IMG_PROMPT: 6,   // Text to Image
    IMG2IMG_PROMPT: 7,   // Image to Image
    IMG2VID_PROMPT: 8,   // Image to Video
    IMAGE_URL: 9,
    STATUS: 10,
    DURATION: 11
  }
};

// Overview sheet layout
const OVERVIEW = {
  HEADER_ROW: 1,
  STATS_ROW: 2,
  FILTER_ROW: 4,
  DATA_START_ROW: 6
};

// Colors
const COLORS = {
  HEADER: '#4285f4',
  HEADER_TEXT: '#ffffff',
  LIGHT_BLUE: '#e8f0fe',
  LIGHT_GREEN: '#e6f4ea',
  LIGHT_ORANGE: '#fef7e0',
  LIGHT_RED: '#fce8e6',
  LIGHT_PURPLE: '#f3e5f5',
  REQUIRED: '#fff9c4',
  GRAY: '#f5f5f5',
  ACT_A: '#e3f2fd',
  ACT_B: '#f3e5f5',
  ACT_C: '#fff3e0',
  ACT_D: '#e8f5e9',
  EPISODE: '#bbdefb',
  SCENE: '#c8e6c9'
};

// Prompt templates for different AI tools
const PROMPT_TEMPLATES = {
  // For Midjourney, DALL-E, Stable Diffusion
  textToImage: {
    prefix: '',
    suffix: ', cinematic lighting, high quality, detailed, 8k resolution',
    style: {
      'Cinematic': ', cinematic film look, 35mm film, shallow depth of field, movie quality',
      'Anime': ', anime style, vibrant colors, cel shading, Studio Ghibli inspired',
      'Realistic': ', photorealistic, ultra detailed, natural lighting, professional photography',
      'Cartoon': ', cartoon style, bold outlines, bright colors, stylized'
    }
  },
  // For combining images (Whisk, Photoshop AI, etc)
  imageToImage: {
    prefix: 'Combine these elements: ',
    suffix: '. Maintain consistent style and lighting.',
    instructions: 'Background: [LOCATION]. Characters: [CHARACTERS]. Style: [STYLE].'
  },
  // For Runway, Pika, Hailuo, VEO
  imageToVideo: {
    prefix: '',
    suffix: ', smooth motion, cinematic, 8 seconds duration',
    camera: {
      'Wide': 'Camera slowly pushes in',
      'Medium': 'Camera tracks character movement',
      'Close-up': 'Camera holds steady with subtle movement',
      'Tracking': 'Camera follows action smoothly'
    }
  }
};
