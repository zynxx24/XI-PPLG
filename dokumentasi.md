# 📚 Dokumentasi Teknis XI PPLG Website

Dokumentasi ini ditujukan untuk pengembang atau siswa yang ingin memodifikasi, menjalankan secara lokal, atau memahami cara kerja website ini.

---

## 📂 Struktur Project

```
XI-PPLG/
├── README.md               # Halaman depan dokumentasi (untuk GitHub)
├── dokumentasi.md          # Dokumentasi teknis ini
└── general/                # Folder utama website
    ├── index.html          # Halaman utama (Landing Page)
    ├── js/
    │   ├── main.js         # Logic untuk berita/lomba (dari Google Sheets)
    │   └── tailwind-config.js # Konfigurasi Tailwind global
    ├── style/              # Style global
    ├── asset/              # Aset global (Logo, icon, gambar)
    └── class/              # Halaman-halaman spesifik kelas
        ├── jadwal-pelajaran.html
        ├── data-kas.html
        ├── foto-bareng.html
        ├── js/             # Script khusus per halaman
        │   ├── data-kas.js
        │   ├── jadwal-pelajaran.js
        │   └── foto-bareng.js
        ├── style/          # CSS khusus per halaman
        └── JSON/           # Data statis (Jadwal, Foto, Piket)
            ├── jadwal-pelajaran.JSON
            ├── daftar-guru.JSON
            ├── jadwal-piket.JSON
            └── photo-data.JSON
```

---

## 🚀 Menjalankan Project Secara Lokal

### Permasalahan Path
Website ini dikonfigurasi untuk GitHub Pages dengan base path `/XI-PPLG/`. Semua link aset menggunakan **absolute path** seperti:
```html
<link rel="icon" href="/XI-PPLG/general/asset/PPLG-LOGO.ico">
<script src="/XI-PPLG/general/js/main.js"></script>
```

**Masalah**: Jika dijalankan langsung di local (`file://` atau `localhost`), path `/XI-PPLG/` tidak ditemukan.

### Solusi

#### Opsi 1: Rename Folder
1. Rename folder project menjadi `XI-PPLG` (pastikan huruf besar/kecil sama).
2. Letakkan folder di root drive atau folder yang bisa diakses sebagai root server.
3. Jalankan Live Server dari folder **parent** dari `XI-PPLG`, bukan dari dalam folder itu sendiri.

#### Opsi 2: Edit Path Sementara (Untuk Development)
Ubah semua path absolut menjadi relatif:
```html
<!-- DARI -->
<script src="/XI-PPLG/general/js/main.js"></script>
<!-- MENJADI -->
<script src="js/main.js"></script>
```
> ⚠️ **Jangan commit perubahan ini ke GitHub!**

#### Opsi 3: Menggunakan http-server dengan base-url
```bash
npx http-server -o /XI-PPLG/general/
```

---

## 🛠️ Penjelasan Modul

### 1. 📅 Jadwal Pelajaran (`jadwal-pelajaran.js`)
**Lokasi**: `general/class/js/jadwal-pelajaran.js`

#### Sumber Data (JSON Lokal):
| File | Deskripsi |
|------|-----------|
| `jadwal-pelajaran.JSON` | Data jadwal per hari (Senin-Jumat), berisi mapel, guru, dan durasi jam |
| `daftar-guru.JSON` | Data guru: kode, nama, mata pelajaran, nomor telepon |
| `jadwal-piket.JSON` | Data petugas piket harian |

#### Konfigurasi Penting:
```javascript
const SUBJECT_CONFIG = {
    "Rekayasa Perangkat Lunak": { gpu: "rpl", text: "text-blue-100", small: "text-blue-200" },
    // ... mapel lainnya
};
```
- `gpu`: Kode CSS class untuk background color
- `text`: Warna teks utama
- `small`: Warna teks guru

#### Cara Edit Data Piket:
Buka `general/class/JSON/jadwal-piket.JSON`:
```json
{
  "senin": ["NAMA SISWA 1", "NAMA SISWA 2"],
  "selasa": ["NAMA SISWA 3"],
  ...
}
```

---

### 2. 💸 Data Kas (`data-kas.js`)
**Lokasi**: `general/class/js/data-kas.js`

#### Sumber Data: Google Sheets (Online)
```javascript
const FilePath = 'https://docs.google.com/spreadsheets/d/e/PACX-xxx/pub?output=xlsx';
const SheetDoc = 'history';      // Sheet untuk chart
const SheetData = 'doc';         // Sheet riwayat payment
const DataKas = 'datakas';       // Sheet status bayar siswa
const SheetDendaData = 'denda';
const SheetPengeluarData = 'pengeluaran';
const SheetDonaturData = 'donatur';
```

#### Kolom yang Diharapkan di Google Sheets:
| Sheet | Kolom |
|-------|-------|
| `doc` | `nama`, `metode`, `from`, `jumlah`, `tanggal` |
| `history` | `date`, `endValue`, `daily` |
| `datakas` | `Nama`, `Tanggal`, `__EMPTY`, `__EMPTY_1`, dst. (untuk checklist) |
| `pengeluaran` | `barang`, `jumlah`, `harga_satuan`, `harga_akhir`, `tanggal` |
| `denda` | `nama`, `deskripsi`, `nominal`, `tanggal` |
| `donatur` | `nama`, `deskripsi`, `nominal`, `tanggal` |

#### Format Tanggal:
Tanggal dari Excel menggunakan **Serial Date Number**. Konversi dilakukan dengan:
```javascript
const excelEpoch = new Date(1899, 11, 30);
const jsDate = new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000);
```

---

### 3. 📸 Foto Bareng (`foto-bareng.js`)
**Lokasi**: `general/class/js/foto-bareng.js`

#### Sumber Data:
```javascript
const res = await fetch('./JSON/photo-data.JSON');
```

#### Format Data:
```json
[
  {
    "id": 1,
    "image": "path/to/image.jpg",
    "title": "Judul Foto",
    "description": "Deskripsi",
    "emoji": "📸",
    "category": "kegiatan",
    "tags": ["tag1", "tag2"]
  }
]
```

---

### 4. 📰 Berita & Landing Page (`main.js`)
**Lokasi**: `general/js/main.js`

#### Sumber Data: Google Sheets
```javascript
const GOOGLE_SHEETS_CONFIG = {
    baseUrl: 'https://docs.google.com/spreadsheets/.../pub?output=xlsx',
    lombaSheet: 'lomba',
    newsSheet: 'news'
};
```

#### Kolom yang Diharapkan:
| Sheet | Kolom |
|-------|-------|
| `lomba` | `judul`, `deskripsi`, `emoji`, `tanggal`, `reporter`, `lokasi`, `highlight_1_angka`, `highlight_1_label`, dst. |
| `news` | `judul`, `deskripsi`, `kategori`, `tanggal`, `tim`, `estimasi_baca`, `layout_type` (`grid`/`additional`) |

---

## ⚠️ Potensi Bug & Error

### 1. Duplikasi Fungsi `dateToJSDate`
**File**: `data-kas.js`  
**Masalah**: Fungsi ini didefinisikan berulang di dalam beberapa fungsi (line ~304, ~398, ~459, dst).  
**Dampak**: Tidak efisien, susah di-maintain.  
**Solusi**: Pindahkan ke satu fungsi global di awal file.

### 2. Error jika Element Tidak Ada
**File**: `main.js` (line ~579)
```javascript
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
mobileMenuBtn.addEventListener('click', ...); // ERROR jika element tidak ada!
```
**Dampak**: Script crash di halaman yang tidak punya element ini.  
**Solusi**: Selalu cek `if (mobileMenuBtn)` sebelum `addEventListener`.

### 3. Google Sheets Tidak Publish
**Masalah**: Jika Google Sheets belum di-publish ke web, `fetch()` akan gagal.  
**Solusi**: Pastikan Sheets sudah: `File > Share > Publish to web > Entire Document > xlsx`.

### 4. Missing Data Handler
**File**: `data-kas.js` (catch block - line ~75-108)  
**Masalah**: Mock data tidak lengkap (tidak ada `pengeluarData`, `dendaData`, `donaturData`).  
**Dampak**: `updateStats()` bisa error karena data undefined.

---

## 🚀 Optimasi Performa

### 1. Animasi Berat di `main.js`
**Masalah**:
```javascript
setInterval(createFloatingEmoji, 3000);  // Buat emoji baru tiap 3 detik
setInterval(() => { ... }, 2000);         // Update neon tiap 2 detik
setInterval(loadNews, 5 * 60 * 1000);     // Auto-refresh tiap 5 menit
```
**Dampak**:
- Emoji terus dibuat tanpa batas → memory leak
- Banyak `setInterval` berjalan bersamaan → CPU usage tinggi
- `loadNews` auto-refresh mengunduh data besar berulang kali

**Solusi yang Disarankan**:
```javascript
// Batasi jumlah emoji
let emojiCount = 0;
const MAX_EMOJIS = 10;
function createFloatingEmoji() {
    if (emojiCount >= MAX_EMOJIS) return;
    emojiCount++;
    // ... sisanya sama
    // Di dalam setInterval yang menghapus emoji:
    emojiCount--;
}

// Atau disable di mobile
if (window.innerWidth > 768) {
    setInterval(createFloatingEmoji, 3000);
}
```

### 2. Scroll Event Listener Berat
**File**: `main.js` (line ~659)
```javascript
window.addEventListener('scroll', () => { ... }); // Dipanggil setiap scroll!
```
**Masalah**: Ada 2 scroll listener terpisah.  
**Solusi**: Gabungkan menjadi satu dengan `requestAnimationFrame`.

### 3. Virtual Scrolling di Payment Table
**File**: `data-kas.js` - `loadPaymentTable()`  
**Status**: ✅ Sudah diimplementasikan dengan baik (render hanya item visible).

### 4. Tailwind via CDN
**Masalah**: Tailwind CSS via CDN memuat seluruh framework (~3MB).  
**Solusi untuk Production**: Build Tailwind dengan purge/JIT untuk ukuran lebih kecil.

---

## 🔧 Tips Development

### Menambah Mata Pelajaran Baru
1. Buka `jadwal-pelajaran.js`
2. Tambahkan entry di `SUBJECT_CONFIG`:
```javascript
"Mata Pelajaran Baru": { gpu: "newcode", text: "text-teal-100", small: "text-teal-200" }
```
3. Tambahkan CSS class di `jadwal-pelajaran.css`:
```css
.subject-newcode { background: linear-gradient(135deg, #14b8a6, #0d9488); }
```

### Debugging Google Sheets
```javascript
// Tambahkan ini di console browser untuk test:
await testFetch(); // Fungsi sudah ada di main.js
```

### Cek Apakah Data Berhasil Load
Buka Developer Console (F12) dan lihat log:
```
Payment Data: Successfully loaded
Kas Chart Data: Successfully loaded
...
```

---

## 📝 Checklist Sebelum Deploy

- [ ] Google Sheets sudah di-publish
- [ ] Semua path menggunakan `/XI-PPLG/...` (bukan relatif)
- [ ] Test di mobile (responsive)
- [ ] Hapus `console.log` yang tidak perlu
- [ ] Test offline fallback (mock data)

---

*Dokumentasi ini dibuat untuk membantu pengembang memahami dan memodifikasi codebase XI PPLG dengan aman.*
