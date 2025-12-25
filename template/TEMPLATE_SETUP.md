# Google Sheet Template Setup Guide

Dokumen ini menjelaskan struktur template Google Sheet yang harus dibuat secara manual.

## Worksheet Structure

### 1. 🎬 Story (Tab Color: #4285F4 - Blue)

#### Row 1: Header
- Merge A1:H1
- Text: "🎬 AI FILMMAKING STUDIO"
- Font: 24pt, Bold, White
- Background: #4285F4 (Google Blue)

#### Row 2-4: Project Info Section
| Cell | Label | Input Cell | Validation |
|------|-------|------------|------------|
| A2 | "Project:" | B2 | Free text |
| A3 | "Genre:" | B3 | Dropdown: Action, Drama, Comedy, Horror, Sci-Fi, Romance, Thriller, Fantasy, Animation |
| A4 | "Style:" | B4 | Dropdown: Cinematic, Anime, Cartoon, Realistic, Noir, Vintage, Futuristic |

- Label cells (A2:A4): Bold, Right-aligned
- Input cells (B2:B4): Light yellow background (#FFF9C4)

#### Row 5: Section Header
- Merge A5:H5
- Text: "📝 SYNOPSIS"
- Font: 14pt, Bold
- Background: #E3F2FD (Light Blue)

#### Row 6-10: Synopsis Input
- Merge A6:H10
- Light yellow background (#FFF9C4)
- Text wrap enabled
- Placeholder text (gray italic): "Tulis synopsis cerita kamu di sini... (minimal 2-3 paragraf untuk hasil terbaik)"

#### Row 11: Action Buttons Area
- A11: "[🤖 Generate Episodes]" - This will be a drawing/button

#### Row 12: Episodes & Scenes Header
- Merge A12:H12
- Text: "📺 EPISODES & SCENES"
- Font: 14pt, Bold
- Background: #E3F2FD

#### Row 13: Table Headers
| Column | Header | Width |
|--------|--------|-------|
| A | # | 50px |
| B | Type | 80px |
| C | Title/Description | 300px |
| D | Location | 150px |
| E | Time | 100px |
| F | Characters | 150px |
| G | Shot | 100px |
| H | Status | 100px |

- All headers: Bold, Center-aligned, Background #BBDEFB

#### Row 14+: Data Rows
- Alternating row colors: White / #F5F5F5
- Status column validation: Draft, In Progress, Done
- Time column validation: Morning, Afternoon, Evening, Night
- Shot column validation: Wide, Medium, Close-up, Extreme Close-up, POV

---

### 2. 👥 Characters (Tab Color: #34A853 - Green)

#### Row 1: Header
- Merge A1:J1
- Text: "👥 CHARACTER DATABASE"
- Font: 24pt, Bold, White
- Background: #34A853 (Google Green)

#### Row 2: Help Text
- Merge A2:J2
- Text: "Definisikan karakter dengan detail untuk konsistensi visual. Klik 'Generate Reference' untuk membuat reference images."
- Font: 10pt, Italic, Gray (#666666)

#### Row 3: Table Headers
| Column | Header | Width |
|--------|--------|-------|
| A | Name | 120px |
| B | Role | 100px |
| C | Age | 60px |
| D | Gender | 80px |
| E | Appearance | 250px |
| F | Costume | 200px |
| G | Personality | 150px |
| H | Ref Image | 100px |
| I | Status | 80px |
| J | Actions | 100px |

- All headers: Bold, Center-aligned, Background #C8E6C9

#### Row 4+: Data Rows
- Role validation: Protagonist, Antagonist, Supporting, Minor
- Gender validation: Male, Female, Non-binary, Other
- Status validation: New, Has Reference, Complete
- Appearance & Costume cells: Light yellow background (#FFF9C4), Text wrap
- Ref Image column: Will contain IMAGE() formula for thumbnails

#### Row 15: Character Detail Section Header
- Merge A15:J15
- Text: "📸 CHARACTER REFERENCE IMAGES"
- Font: 14pt, Bold
- Background: #C8E6C9

#### Row 16-25: Reference Image Display Area
- This area will show selected character's reference images
- Layout for T-pose, face angles, and expressions

---

### 3. 🎨 Assets (Tab Color: #FBBC04 - Yellow)

#### Row 1: Header
- Merge A1:J1
- Text: "🎨 GENERATED ASSETS"
- Font: 24pt, Bold, White
- Background: #EA4335 (Google Red) - untuk contrast

#### Row 2: Filter & Actions Bar
| Cell | Content |
|------|---------|
| A2 | "Filter:" |
| B2 | Dropdown: All, Scene, Close-up, Action |
| C2 | "Episode:" |
| D2 | Dropdown: All, 1, 2, 3, 4, 5 |
| E2 | "Status:" |
| F2 | Dropdown: All, Pending, Generated, Error |

- G2-J2: Action buttons area

#### Row 3: Table Headers
| Column | Header | Width |
|--------|--------|-------|
| A | ID | 60px |
| B | Scene | 80px |
| C | Type | 80px |
| D | Description | 250px |
| E | Preview | 100px |
| F | Image URL | 200px |
| G | Video Prompt | 250px |
| H | Status | 80px |
| I | Created | 100px |
| J | Actions | 80px |

- All headers: Bold, Center-aligned, Background #FFECB3

#### Row 4+: Data Rows
- Type validation: Scene, Close-up, Action, Transition, Establishing
- Status validation: Pending, Generating, Generated, Error
- Preview column: Will contain IMAGE() formula for thumbnails
- Alternating row colors: White / #FFF8E1

#### Row 20: Asset Detail Section Header
- Merge A20:J20
- Text: "🖼️ ASSET DETAIL"
- Font: 14pt, Bold
- Background: #FFECB3

#### Row 21-30: Asset Detail Display Area
- Large preview image
- Full video prompt text
- Copy buttons

---

## Data Validation Rules

### Dropdowns to Create

```
Genre: Action, Drama, Comedy, Horror, Sci-Fi, Romance, Thriller, Fantasy, Animation
Style: Cinematic, Anime, Cartoon, Realistic, Noir, Vintage, Futuristic
Time of Day: Morning, Afternoon, Evening, Night
Shot Type: Wide, Medium, Close-up, Extreme Close-up, POV, Over-the-shoulder
Status (Story): Draft, In Progress, Done
Status (Character): New, Has Reference, Complete
Status (Asset): Pending, Generating, Generated, Error
Role: Protagonist, Antagonist, Supporting, Minor
Gender: Male, Female, Non-binary, Other
Asset Type: Scene, Close-up, Action, Transition, Establishing
```

## Color Palette

| Purpose | Color Code | Usage |
|---------|------------|-------|
| Story Tab | #4285F4 | Tab color, headers |
| Story Light | #E3F2FD | Section headers |
| Story Header BG | #BBDEFB | Table headers |
| Characters Tab | #34A853 | Tab color, headers |
| Characters Light | #C8E6C9 | Section headers, table headers |
| Assets Tab | #EA4335 | Tab color, main header |
| Assets Light | #FFECB3 | Section headers, table headers |
| Required Field | #FFF9C4 | Input cells that need user input |
| Alt Row | #F5F5F5 | Alternating row background |
| Help Text | #666666 | Gray italic help text |

## Conditional Formatting Rules

### Status Column Colors
- "Draft" / "New" / "Pending": Background #FFF9C4 (Yellow)
- "In Progress" / "Generating": Background #E3F2FD (Blue)
- "Done" / "Complete" / "Generated": Background #C8E6C9 (Green)
- "Error": Background #FFCDD2 (Red)

## Named Ranges (Optional)

```
Synopsis = '🎬 Story'!A6:H10
ProjectName = '🎬 Story'!B2
Genre = '🎬 Story'!B3
Style = '🎬 Story'!B4
EpisodesTable = '🎬 Story'!A14:H100
CharactersTable = '👥 Characters'!A4:J50
AssetsTable = '🎨 Assets'!A4:J200
```
