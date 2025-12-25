# 🎬 AI Filmmaking Studio

Google Sheets template untuk membuat film/konten dengan AI. Cukup tulis synopsis, AI akan generate characters, episodes, scenes, dan prompts untuk AI image/video tools.

## ✨ Features

- **One-Click Generation** - Synopsis → Characters, Episodes, Scenes, Acts
- **4 Acts per Scene** - Setup, Development, Climax, Resolution
- **Character Consistency** - Seed-based untuk wajah konsisten
- **Dual Prompts** - Image Prompt (Midjourney/DALL-E) + Video Prompt (VEO/Runway)
- **Multiple Content Types** - Film, Drama Series, Mini Drama, TikTok, dll
- **New Project Reset** - Mulai project baru tanpa buat spreadsheet baru

## 📁 File Structure

```
src/
├── API.gs        - Pollinations API integration
├── Config.gs     - Constants and configuration
├── Setup.gs      - Template setup and reset
├── Utils.gs      - Helper functions
├── Generator.gs  - Main generation logic
├── Prompts.gs    - Prompt building for AI tools
└── Code.gs       - Menu and UI functions
```

## 🚀 Quick Start

### Setup
1. Buat Google Spreadsheet baru
2. Buka Extensions → Apps Script
3. Copy semua file `.gs` ke Apps Script
4. Run `setupTemplate()` untuk setup sheets
5. Refresh spreadsheet (F5) untuk melihat menu

### Usage
1. Pilih **Content Type** (Drama Series, Film, TikTok, dll)
2. Atur **Episodes** dan **Scenes per Episode**
3. Tulis **Synopsis** (minimal 2-3 paragraf, sebutkan nama karakter)
4. Klik menu **🎬 AI Film → 🚀 Generate All from Synopsis**
5. Tunggu 2-5 menit

### After Generation
1. Review **Characters** di tab 👥
2. Review **Episodes/Scenes/Acts** di tab 🎬
3. Generate **Storyboard Assets** untuk visual
4. Copy **Image/Video Prompts** untuk AI tools

## 📋 Menu Structure

```
🎬 AI Film
├── 🚀 Generate All from Synopsis
├── ─────────────
├── 👥 Characters
│   ├── Generate Character Reference
│   └── Generate All References
├── 🎨 Assets
│   ├── Generate Storyboard
│   ├── Copy Image Prompt
│   ├── Copy Video Prompt
│   └── Export All Prompts
├── ─────────────
├── 📁 New Project (Reset)
├── ⚙️ Settings
├── 🧪 Test API
└── ❓ Help
```

## 🎭 4 Acts Structure

Setiap scene memiliki 4 acts:

| Act | Name | Purpose | Default Shot |
|-----|------|---------|--------------|
| A | Setup | Establishing shot, introduce scene | Wide |
| B | Development | Action develops | Medium |
| C | Climax | Peak moment of scene | Close-up |
| D | Resolution | Scene closes/transitions | Medium |

## 📺 Content Types

| Type | Episodes | Scenes/Ep | Act Duration |
|------|----------|-----------|--------------|
| Drama Series | 4 | 5 | 8s |
| Mini Drama | 12 | 3 | 5s |
| Film Movie | 1 | 15 | 10s |
| Short Film | 1 | 6 | 8s |
| Web Series | 6 | 4 | 6s |
| TikTok/Reels | 1 | 1 | 4s |
| YouTube Shorts | 1 | 2 | 5s |
| Music Video | 1 | 8 | 6s |

## 🎨 Using Prompts

### Image Prompt
Copy ke: Midjourney, DALL-E, Stable Diffusion, Flux, Leonardo

### Video Prompt
Copy ke: VEO 3, Runway Gen-3, Pika, Kling, Luma Dream Machine

## 🔧 Troubleshooting

### API Error
1. Klik **🧪 Test API** untuk cek koneksi
2. Jika Text API ❌, coba lagi dalam 1-2 menit
3. Pastikan internet stabil

### Generation Failed
1. Synopsis minimal 100 karakter
2. Sebutkan nama karakter dalam synopsis
3. Coba lagi dengan synopsis lebih detail

### Menu Tidak Muncul
1. Refresh halaman (F5)
2. Tunggu beberapa detik
3. Jika masih tidak muncul, run `onOpen()` dari Apps Script

## 📝 License

MIT License - Free to use and modify.

