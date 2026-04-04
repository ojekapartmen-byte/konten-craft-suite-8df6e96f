# Spesifikasi Desain Halaman — Mobile Command Center

## Global Styles (Design Tokens)
- Target utama: mobile (360–430px); adaptif tablet (>=768px) dengan grid lebih rapat.
- Background: #0B1220 (dark) / #F7F8FA (light)
- Surface/card: #111B2E (dark) / #FFFFFF (light)
- Primary/accent: #4F8CFF
- Text: #EAF0FF (dark) / #101828 (light)
- Border: rgba(255,255,255,0.08) / #E5E7EB
- Typography:
  - H1 20–22 semibold, H2 16–18 semibold, Body 14–16 regular, Caption 12
- Button states:
  - Default: filled primary, radius 12
  - Pressed: opacity 0.85 + scale 0.98
  - Disabled: opacity 0.45
- Link/button fokus aksesibilitas: outline 2px accent (untuk mode keyboard/tablet)
- Spacing scale: 4, 8, 12, 16, 24

## Meta Information (per screen)
- Command Center: title “Command Center”, description “Shortcut cepat ke dashboard & tools harian”
- Kelola Link: title “Kelola Link”, description “Tambah, edit, dan urutkan link”
- Pengaturan: title “Pengaturan”, description “Atur tampilan dan cara membuka link”

---

## 1) Screen: Command Center

### Layout
- Sistem layout: Flexbox (kolom utama) + grid berbasis multi-column (FlatList numColumns) untuk tombol.
- Responsif:
  - Mobile: 2–3 kolom (bergantung lebar)
  - Tablet: 4–6 kolom
- Safe area: gunakan padding top/bottom sesuai notch.

### Page Structure
1. Top App Bar
2. Konten scroll (section per grup)
3. Bottom tab (Command Center / Kelola Link / Pengaturan)

### Sections & Components
1. Top App Bar
   - Kiri: judul “Command Center”
   - Kanan: tombol ikon “Edit” (shortcut ke Kelola Link)
2. Section Grup (berulang)
   - Header grup: nama grup + opsi kecil “lihat semua” (opsional, tetap di halaman yang sama dengan scroll ke grup)
   - Grid tombol shortcut:
     - Komponen “ShortcutCard”
       - Ikon (dari field icon) dalam lingkaran/rounded square
       - Judul (max 2 baris, ellipsis)
       - Warna aksen (border/gradient tipis dari field color)
       - State tidak aktif: grayscale + label “Nonaktif” kecil
3. Interaksi
   - Tap: buka link
   - Long-press: quick actions minimal (Edit, Nonaktifkan/Aktifkan, Hapus) membuka action sheet
4. Empty State
   - Ilustrasi sederhana + teks “Belum ada link”
   - CTA tombol “Tambah Link” menuju Kelola Link

---

## 2) Screen: Kelola Link

### Layout
- Sistem layout: Flexbox + list bertingkat.
- Pola: segment/tab internal “Grup” dan “Link” (atau list gabungan dengan header sticky).

### Page Structure
1. Top App Bar (Back jika dibuka dari Command Center; jika via tab, tanpa back)
2. Area manajemen grup
3. Area manajemen link
4. Floating Action Button (FAB) “Tambah”

### Sections & Components
1. Manajemen Grup
   - List item grup:
     - Nama grup
     - Handle reorder (ikon drag)
     - Aksi: edit nama, hapus
   - Dialog “Tambah/Edit Grup”: field nama (required)
2. Manajemen Link
   - List item link:
     - Ikon + judul + URL (secondary text)
     - Badge grup
     - Toggle aktif/nonaktif
     - Handle reorder (dalam konteks grup)
     - Aksi: edit, hapus
3. Form Link (sheet/modal)
   - Field wajib: Judul, URL
   - Field opsional: Grup, Ikon, Warna
   - Validasi:
     - URL harus berformat http(s):// atau schema lain yang diterima; jika tidak valid tampilkan helper text
   - Tombol: Simpan (primary), Batal (text)

---

## 3) Screen: Pengaturan

### Layout
- Sistem layout: list settings (stacked cards) dengan switch/radio.

### Page Structure
1. Top App Bar
2. Kartu “Perilaku Buka Link”
3. Kartu “Tampilan”

### Sections & Components
1. Perilaku Buka Link
   - Radio:
     - “In-app browser”
     - “Browser eksternal”
2. Tampilan
   - Theme selector: Sistem / Terang / Gelap
   - Grid density:
     - Slider atau segmented: “Renggang / Normal / Rapat”
   - Preview mini (opsional): contoh 2 baris shortcut dalam card

---

## Struktur Navigasi (UI)
- Bottom Tab Navigation:
  - Tab 1: Command Center
  - Tab 2: Kelola Link
  - Tab 3: Pengaturan
- Modal/Sheet:
  - Form Tambah/Edit Link
  - Form Tambah/Edit Grup
  - Action sheet quick actions (dari long-press shortcut)
