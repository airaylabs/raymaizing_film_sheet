# 📋 Contoh Project: Video Wisuda Santri Pesantren Darussalam Ciamis

## 🎬 Story Worksheet

### Project Info (Row 2-4)

| Field | Value |
|-------|-------|
| **Project Name** | `Wisuda Santri Angkatan 2025 - Pesantren Darussalam Ciamis` |
| **Genre** | `Drama` |
| **Style** | `Cinematic` |

### Synopsis (Cell A6 - area kuning)

```
Video dokumenter wisuda santri angkatan 2025 Pondok Pesantren Darussalam Ciamis, Jawa Barat. Mengisahkan perjalanan para santri dari awal masuk pesantren hingga hari kelulusan yang penuh haru.

Cerita dimulai dengan flashback kenangan pertama kali santri menginjakkan kaki di gerbang pesantren dengan perasaan campur aduk - takut, rindu rumah, tapi juga penuh harapan. Kemudian menampilkan keseharian mereka: bangun subuh untuk sholat berjamaah, mengaji Al-Quran, belajar kitab kuning, hingga kegiatan ekstrakurikuler.

Puncaknya adalah hari wisuda yang khidmat di aula utama pesantren. Para santri dengan jubah kebesaran dan peci putih, diiringi lantunan sholawat, menerima ijazah dari Kyai pengasuh. Air mata haru mengalir - baik dari santri, orang tua, maupun para ustadz yang telah membimbing mereka selama bertahun-tahun. Video ditutup dengan pesan dari Kyai tentang amanah ilmu dan harapan agar para alumni menjadi penerang bagi masyarakat.
```

---

## 👥 Characters Worksheet

### Karakter 1: Ahmad Fauzi (Santri Putra)

| Field | Value |
|-------|-------|
| **Name** | `Ahmad Fauzi` |
| **Role** | `Protagonist` |
| **Age** | `18` |
| **Gender** | `Male` |
| **Appearance** | `Indonesian young man, neat short black hair, warm brown eyes, light brown skin, slim build, height 170cm, gentle sincere smile, clean-shaven face` |
| **Costume** | `White jubah gamis, white peci kopiah, brown leather sandals, holding green Al-Quran` |
| **Personality** | `Humble, diligent, helpful, loves reciting Quran, respected by peers` |

### Karakter 2: Siti Aisyah (Santri Putri)

| Field | Value |
|-------|-------|
| **Name** | `Siti Aisyah` |
| **Role** | `Protagonist` |
| **Age** | `17` |
| **Gender** | `Female` |
| **Appearance** | `Indonesian young woman, face partially visible with hijab frame, bright brown eyes, fair skin, petite build, height 155cm, serene peaceful expression` |
| **Costume** | `White long hijab syari covering chest, white flowing gamis dress, white socks, simple flat shoes, holding Quran with both hands` |
| **Personality** | `Soft-spoken, dedicated hafidza, patient, kind to juniors, strong memorization` |

### Karakter 3: KH. Abdullah Rahman (Kyai)

| Field | Value |
|-------|-------|
| **Name** | `KH Abdullah Rahman` |
| **Role** | `Supporting` |
| **Age** | `65` |
| **Gender** | `Male` |
| **Appearance** | `Indonesian elderly man, white beard reaching chest, wise gentle eyes behind round glasses, weathered tan skin, medium build, height 168cm, warm fatherly smile, wrinkles showing years of wisdom` |
| **Costume** | `Cream colored jubah, brown sorban wrapped around head, white inner cap, wooden prayer beads tasbih in hand, simple leather sandals` |
| **Personality** | `Wise, patient, loving to all santri like own children, firm but gentle, respected scholar` |

### Karakter 4: Ustadz Mahmud (Pembimbing)

| Field | Value |
|-------|-------|
| **Name** | `Ustadz Mahmud` |
| **Role** | `Supporting` |
| **Age** | `40` |
| **Gender** | `Male` |
| **Appearance** | `Indonesian man, short black hair with gray streaks, thick black beard, dark brown eyes, tan skin, stocky build, height 172cm, serious but caring expression` |
| **Costume** | `Light blue koko shirt, white sarong, black peci, carrying kitab kuning book, simple watch` |
| **Personality** | `Strict but fair, dedicated teacher, memorized many hadith, protective of students` |

### Karakter 5: Ibu Fatimah (Orang Tua)

| Field | Value |
|-------|-------|
| **Name** | `Ibu Fatimah` |
| **Role** | `Supporting` |
| **Age** | `45` |
| **Gender** | `Female` |
| **Appearance** | `Indonesian middle-aged woman, face framed by hijab, tired but proud eyes, light brown skin, medium build, height 158cm, emotional teary expression` |
| **Costume** | `Pastel pink hijab, matching long modest dress, simple gold earrings, holding tissue in hand` |
| **Personality** | `Loving mother, emotional, proud of child achievement, grateful, prayerful` |

---

# 🎬 WORKFLOW EDITOR: Dari Scene ke Visual

## Logika Generate Visual

```
SCENE → IMAGE PROMPT → IMAGE → VIDEO PROMPT → VIDEO
         (Text-to-Image)        (Image-to-Video)
```

### Step 1: Generate Character References Dulu
Sebelum generate scene, editor harus punya reference image karakter untuk konsistensi.

### Step 2: Generate Scene Image
Gabungkan: Scene Description + Character Appearance + Location + Style

### Step 3: Generate Video dari Image
Gunakan image hasil + video prompt untuk motion

---

## 📸 CONTOH OUTPUT YANG AKAN DI-GENERATE

### Scene 1.1: Ahmad Tiba di Pesantren

**Scene Data:**
| Field | Value |
|-------|-------|
| Scene | 1.1 |
| Description | Ahmad Fauzi kecil turun dari mobil, menatap gerbang pesantren dengan takjub dan sedikit takut |
| Location | Gerbang Pesantren |
| Time | Morning |
| Characters | Ahmad Fauzi |
| Shot | Wide |

---

#### 🖼️ IMAGE PROMPT (Text-to-Image)
*Untuk Midjourney / DALL-E / Pollinations / Flux*

```
Wide shot of Indonesian young man Ahmad Fauzi, neat short black hair, warm brown eyes, light brown skin, slim build, gentle sincere smile, wearing white jubah gamis, white peci kopiah, brown leather sandals, holding green Al-Quran. Standing at traditional Indonesian Islamic boarding school gate, looking up with amazement and slight nervousness. Morning golden hour lighting, warm sunlight, green and white pesantren buildings in background, Arabic calligraphy on gate arch, palm trees, peaceful atmosphere. Cinematic composition, film grain, shallow depth of field, 35mm film look.
```

**Breakdown:**
- Character: `Ahmad Fauzi appearance + costume`
- Action: `turun dari mobil, menatap dengan takjub`
- Location: `gerbang pesantren tradisional`
- Time: `morning golden hour`
- Style: `cinematic, 35mm`

---

#### 🎬 VIDEO PROMPT (Image-to-Video)
*Untuk VEO 3 / Runway / Pika / Kling / Luma*

```
Wide shot of young Indonesian santri boy standing at pesantren gate. Camera slowly pushes in toward the boy. He looks up at the gate with wonder, slight nervous expression, takes a deep breath. Morning sunlight creates warm glow. Gentle breeze moves nearby palm leaves. Peaceful ambient atmosphere. Duration: 5 seconds. Cinematic quality, smooth slow motion.
```

**Breakdown:**
- Shot: `Wide shot`
- Subject: `young santri at gate`
- Camera: `slow push in`
- Action: `looks up with wonder, takes breath`
- Atmosphere: `morning, warm, peaceful`
- Duration: `5 seconds`

---

### Scene 2.1: Sholat Subuh Berjamaah

**Scene Data:**
| Field | Value |
|-------|-------|
| Scene | 2.1 |
| Description | Santri berbaris rapi untuk sholat subuh berjamaah di masjid |
| Location | Masjid Pesantren |
| Time | Dawn |
| Characters | Ahmad Fauzi, KH Abdullah Rahman |
| Shot | Wide |

---

#### 🖼️ IMAGE PROMPT (Text-to-Image)

```
Wide shot interior of traditional Indonesian mosque during dawn prayer. Rows of male santri students in white jubah gamis and white peci praying in congregation. In front row, Ahmad Fauzi - Indonesian young man, neat short black hair, warm brown eyes, light brown skin, wearing white jubah gamis, white peci. Leading prayer is KH Abdullah Rahman - Indonesian elderly man, white beard reaching chest, wise gentle eyes behind round glasses, wearing cream jubah, brown sorban. Soft blue dawn light through windows, prayer rugs in neat rows, white walls with green accents, Arabic calligraphy, peaceful spiritual atmosphere. Cinematic lighting, film grain, 35mm.
```

---

#### 🎬 VIDEO PROMPT (Image-to-Video)

```
Wide shot of mosque interior during dawn prayer. Rows of santri in white clothing performing sujud prostration in perfect unison. Camera static, capturing the synchronized movement. Soft dawn light gradually brightening through windows. Peaceful, spiritual atmosphere. Subtle dust particles visible in light beams. Duration: 5 seconds. Cinematic quality, smooth motion.
```

---

### Scene 4.3: Penyerahan Ijazah

**Scene Data:**
| Field | Value |
|-------|-------|
| Scene | 4.3 |
| Description | Ahmad menerima ijazah dari Kyai, bersalaman dengan hormat |
| Location | Panggung Aula |
| Time | Morning |
| Characters | Ahmad Fauzi, KH Abdullah Rahman |
| Shot | Medium |

---

#### 🖼️ IMAGE PROMPT (Text-to-Image)

```
Medium shot on graduation stage. Ahmad Fauzi - Indonesian young man, neat short black hair, warm brown eyes, light brown skin, wearing white jubah gamis graduation robe, white peci - receiving diploma certificate with both hands, bowing respectfully. KH Abdullah Rahman - Indonesian elderly man, white beard, wise eyes behind round glasses, wearing cream jubah, brown sorban - handing over the diploma with warm fatherly smile. Green and white stage decorations, Islamic geometric patterns, banner "Wisuda Santri" in background. Warm indoor lighting, emotional proud moment. Cinematic, shallow depth of field, 35mm film look.
```

---

#### 🎬 VIDEO PROMPT (Image-to-Video)

```
Medium shot of graduation ceremony on stage. Elderly Kyai in cream robe hands diploma to young santri in white graduation robe. The young man receives it with both hands, bows deeply in respect. Kyai places hand on student's shoulder with proud smile. Emotional moment, slight camera push in. Warm lighting, audience blur in background. Duration: 5 seconds. Cinematic quality, smooth motion.
```

---

### Scene 4.5: Pelukan Ibu dan Anak

**Scene Data:**
| Field | Value |
|-------|-------|
| Scene | 4.5 |
| Description | Ahmad memeluk Ibu Fatimah yang menangis bahagia |
| Location | Halaman Pesantren |
| Time | Afternoon |
| Characters | Ahmad Fauzi, Ibu Fatimah |
| Shot | Close-up |

---

#### 🖼️ IMAGE PROMPT (Text-to-Image)

```
Close-up emotional shot. Ahmad Fauzi - Indonesian young man, neat short black hair, warm brown eyes, wearing white jubah gamis, white peci - embracing his mother tightly. Ibu Fatimah - Indonesian middle-aged woman in pastel pink hijab and matching dress - crying tears of joy, holding tissue, emotional proud expression. Outdoor pesantren courtyard, afternoon golden hour lighting, soft bokeh background with other families celebrating. Intimate emotional moment, tears visible, warm embrace. Cinematic, shallow depth of field, emotional lighting, 35mm film look.
```

---

#### 🎬 VIDEO PROMPT (Image-to-Video)

```
Close-up shot of emotional mother-son embrace after graduation. Mother in pink hijab crying happy tears, son in white graduation robe holding her tight. Camera slowly orbits around them. Mother wipes tears with tissue, son comforts her. Golden afternoon sunlight creates warm glow. Other celebrating families blur in background. Duration: 5 seconds. Cinematic quality, emotional, smooth slow motion.
```

---

## 🎨 CHARACTER REFERENCE PROMPTS

### Ahmad Fauzi - Full Body Reference
```
Full body character reference sheet, T-pose, front view. Indonesian young man, age 18, neat short black hair, warm brown eyes, light brown skin, slim build, height 170cm, gentle sincere smile, clean-shaven face. Wearing white jubah gamis, white peci kopiah, brown leather sandals, holding green Al-Quran. White background, character design, full body visible, clean lighting.
```

### Ahmad Fauzi - Face Sheet (4 Angles)
```
Character face reference sheet, 4 angles in grid. Indonesian young man, neat short black hair, warm brown eyes, light brown skin, gentle sincere smile. Views: front face, left profile, right profile, 3/4 angle. Wearing white peci kopiah. White background, portrait lighting, detailed facial features.
```

### Ahmad Fauzi - Expression Sheet
```
Character expression sheet, 4 expressions in grid. Indonesian young man, neat short black hair, warm brown eyes, light brown skin, wearing white peci. Expressions: neutral calm, happy smiling, sad tearful, determined focused. White background, portrait lighting.
```

### Siti Aisyah - Full Body Reference
```
Full body character reference sheet, front view. Indonesian young woman, age 17, face framed by white hijab, bright brown eyes, fair skin, petite build, height 155cm, serene peaceful expression. Wearing white long hijab syari covering chest, white flowing gamis dress, white socks, simple flat shoes, holding Quran with both hands. White background, modest Islamic dress, character design.
```

### KH Abdullah Rahman - Full Body Reference
```
Full body character reference sheet, front view. Indonesian elderly man, age 65, white beard reaching chest, wise gentle eyes behind round gold glasses, weathered tan skin, medium build, height 168cm, warm fatherly smile. Wearing cream colored jubah, brown sorban turban wrapped around head, white inner cap, wooden prayer beads tasbih in right hand, simple leather sandals. White background, Islamic scholar appearance, dignified pose.
```

---

## 📁 LOCATION/BACKGROUND PROMPTS

### Gerbang Pesantren
```
Traditional Indonesian Islamic boarding school entrance gate, white painted concrete arch with green trim, Arabic calligraphy "Pondok Pesantren Darussalam" on top, iron gate doors, palm trees on sides, clean paved pathway leading inside, white and green buildings visible in background, morning golden hour lighting, peaceful welcoming atmosphere, no people.
```

### Masjid Interior
```
Interior of traditional Indonesian pesantren mosque, prayer hall with rows of green prayer rugs, white walls with green accent stripes, Arabic calligraphy decorations, wooden mimbar pulpit on right, ceiling fans, natural light through arched windows, dawn blue lighting atmosphere, peaceful spiritual space, no people.
```

### Aula Wisuda
```
Large graduation hall interior in Indonesian pesantren, rows of white plastic chairs facing stage, green and white fabric decorations, Islamic geometric pattern banners, stage with wooden podium, banner reading "Wisuda Santri Angkatan 2025", Indonesian flag on stage left, green curtain backdrop, bright indoor lighting, festive formal atmosphere, no people.
```

### Halaman Pesantren
```
Courtyard of Indonesian Islamic boarding school, clean concrete ground, white and green painted buildings surrounding, palm trees providing shade, wooden benches, students' sandals lined up near building entrance, afternoon golden hour lighting, peaceful campus atmosphere, no people.
```

### Asrama Santri
```
Simple dormitory room in Indonesian pesantren, bunk beds with thin mattresses, white sheets, small wooden study desks, Quran stands, prayer rugs folded on beds, window with curtain, ceiling fan, modest clean space, warm afternoon light through window, no people.
```

---

## 🔄 WORKFLOW UNTUK EDITOR

### Tahap 1: Persiapan Asset
1. Generate semua **Character Reference** (full body + face sheet)
2. Generate semua **Location Background** tanpa orang
3. Simpan dengan nama file yang jelas

### Tahap 2: Generate Scene Images
1. Untuk setiap scene, gabungkan:
   - Character description dari reference
   - Scene action/description
   - Location background style
   - Time of day lighting
   - Shot type (wide/medium/close-up)
   - Visual style (cinematic)

2. Generate image dengan prompt lengkap
3. Review dan regenerate jika perlu

### Tahap 3: Generate Videos
1. Ambil image hasil yang sudah bagus
2. Upload ke video AI tool (VEO/Runway/Pika)
3. Gunakan video prompt yang sesuai
4. Set duration 3-5 detik per clip

### Tahap 4: Edit di CapCut/Premiere
1. Import semua video clips
2. Susun sesuai urutan scene
3. Tambah transisi
4. Tambah musik/sholawat
5. Tambah text/subtitle
6. Color grading
7. Export final

---

## ✅ CHECKLIST EDITOR

### Pre-Production
- [ ] Character references sudah di-generate (5 karakter)
- [ ] Location backgrounds sudah di-generate (5 lokasi)
- [ ] Episode & scene list sudah final

### Production
- [ ] Scene images di-generate per episode
- [ ] Review quality setiap image
- [ ] Video prompts sudah disiapkan
- [ ] Videos di-generate dari images

### Post-Production
- [ ] Semua clips sudah di-import
- [ ] Timeline sudah disusun
- [ ] Musik/audio sudah ditambah
- [ ] Color grading done
- [ ] Final review
- [ ] Export

---

*Referensi: [Pesantren Darussalam Ciamis](https://www.darussalamciamis.or.id/)*
