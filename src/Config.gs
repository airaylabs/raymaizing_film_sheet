/**
 * Config.gs - Constants and Configuration
 * All sheet layouts and dropdown options
 */

// Sheet names
const SHEETS = {
  STORY: '🎬 Story',
  CHARACTERS: '👥 Characters',
  ASSETS: '🎨 Assets'
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

// Dropdown options
const OPTIONS = {
  contentType: Object.keys(CONTENT_TYPES),
  episodes: ['1','2','3','4','5','6','8','10','12','16','20','24'],
  scenes: ['1','2','3','4','5','6','8','10','12','15','20'],
  timeOfDay: ['Morning','Afternoon','Evening','Night','Dawn','Dusk'],
  shotType: ['Wide','Medium','Close-up','Extreme Close-up','POV','Over-shoulder','Tracking','Aerial'],
  status: ['Draft','In Progress','Generated','Done'],
  charStatus: ['New','Has Reference','Complete'],
  assetStatus: ['Pending','Generating','Generated','Error'],
  role: ['Protagonist','Antagonist','Supporting','Minor'],
  gender: ['Male','Female','Non-binary']
};

// Story sheet layout
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
  SYNOPSIS: 'A7'
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
    STATUS: 9
  }
};

// Assets sheet layout
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
    IMAGE_PROMPT: 6,
    VIDEO_PROMPT: 7,
    IMAGE_URL: 8,
    STATUS: 9,
    DURATION: 10
  }
};

// Colors
const COLORS = {
  HEADER: '#4285f4',
  HEADER_TEXT: '#ffffff',
  LIGHT_BLUE: '#e8f0fe',
  LIGHT_GREEN: '#e6f4ea',
  LIGHT_ORANGE: '#fef7e0',
  LIGHT_RED: '#fce8e6',
  REQUIRED: '#fff9c4',
  GRAY: '#f5f5f5',
  ACT_A: '#e3f2fd',
  ACT_B: '#f3e5f5',
  ACT_C: '#fff3e0',
  ACT_D: '#e8f5e9'
};

