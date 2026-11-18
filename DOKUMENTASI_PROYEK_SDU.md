# DOKUMENTASI LENGKAP SISTEM INFORMASI SDU (SISTEM DAUR ULANG)

---

## 1. PENDAHULUAN & GAMBARAN UMUM PROYEK

### 1.1 Apa Itu SDU?
**SDU (Sistem Daur Ulang)** adalah sebuah platform berbasis web modern yang dirancang untuk menjembatani **masyarakat (warga)** sebagai penghasil sampah daur ulang dengan **pihak pengelola / pengepul sampah (admin)**.

Aplikasi ini mengubah paradigma penanganan sampah konvensional menjadi bernilai ekonomis dan terorganisir secara digital. Masyarakat tidak lagi perlu membuang sampah anorganik begitu saja atau repot mencari tempat penampungan barang bekas. Cukup dengan mengajukan penjemputan dari rumah melalui aplikasi SDU, pengepul akan datang menjemput sampah ke lokasi yang ditentukan, menimbang, dan membayar sesuai dengan tarif standar yang transparan.

### 1.2 Tujuan Utama Sistem
1. **Mendorong Gerakan Ramah Lingkungan:** Mengurangi volume sampah anorganik (plastik, kardus, kaleng, besi, kaca) yang berakhir di Tempat Pemrosesan Akhir (TPA).
2. **Memberikan Nilai Tambah Ekonomis (Circular Economy):** Memberdayakan masyarakat agar mendapatkan penghasilan tambahan dari sampah rumah tangga mereka.
3. **Efisiensi Logistik Operasional Pengepul:** Admin/pengepul dapat melihat persebaran titik penjemputan sampah lengkap dengan koordinat GPS dan rute Google Maps secara instan.
4. **Transparansi Transaksi & Harga:** Menghilangkan ketidakpastian harga barang bekas dengan katalog master harga yang dikelola terpusat oleh admin dan dapat dipantau langsung oleh warga secara *real-time*.

---

## 2. ARSITEKTUR SISTEM & TEKNOLOGI (TECH STACK)

Sistem dibangun menggunakan arsitektur *Client-Server* terpisah (*Decoupled Architecture*) yang mempermudah pemeliharaan, fleksibilitas pengujian lokal, dan kesiapan *deployment* ke cloud/VPS di kemudian hari.

### 2.1 Frontend (Sisi Klien)
* **Framework / Bundler:** **React 19** menggunakan **Vite 8** untuk performa build dan HMR (*Hot Module Replacement*) yang sangat cepat.
* **Routing & Guard:** `react-router-dom` v7 dengan perlindungan rute:
  * `ProtectedRoute`: Memastikan rute hanya bisa diakses oleh akun warga yang sudah login.
  * `AdminRoute`: Memastikan rute khusus admin hanya bisa diakses oleh pengguna dengan role `'admin'`.
* **Peta & Geolokasi:** `leaflet` dan `react-leaflet` untuk fitur pemilihan titik jemput interaktif dan deteksi GPS.
* **Visualisasi Data & Grafik:** `chart.js` dan `react-chartjs-2` untuk grafik tren transaksi bulanan (Bar Chart) dan komposisi jenis sampah (Doughnut Chart).
* **Desain & Ikon:** `@fortawesome/react-fontawesome` dan Font Awesome Solid Icons, dipadukan dengan desain kustom berbasis CSS modular bernuansa hijau ramah lingkungan (`#0b3d2e`, `#1f7a52`, `#2fa66d`, `#c9a45c`).
* **Konfigurasi Lingkungan:** Menggunakan `VITE_API_URL` yang tersentralisasi di `src/config/api.js`, sehingga otomatis beralih antara server lokal (`localhost:5001`) dan server produksi VPS.

### 2.2 Backend (Sisi Server & API)
* **Runtime:** **Node.js** dengan framework **Express.js v5**.
* **Database Driver:** `mysql2` untuk komunikasi query relasional performa tinggi.
* **Manajemen Berkas & Gambar:** `multer` dengan pemisahan penyimpanan otomatis:
  * `uploads/transaksi/`: Untuk foto bukti fisik sampah daur ulang.
  * `uploads/profil/`: Untuk foto profil akun warga dan admin.
* **Konfigurasi Environment:** `dotenv` untuk mengelola port server dan kredensial basis data tanpa *hardcoding*.
* **Containerization Ready:** Dilengkapi berkas `Dockerfile` berbasis `node:20-alpine` untuk kemudahan deploy ke server container.

### 2.3 Basis Data (Database MySQL)
Skema relasional `sdu_db` terdiri dari 3 entitas utama:
1. **`user`**: Menyimpan data identitas warga dan administrator (`nama`, `no_hp` sebagai akun login, `password`, `role`: `'admin'|'user'`, `alamat`, `foto_profil`).
2. **`harga_sampah`**: Master data kategori sampah (`plastik`, `kardus`, `botol`, `kaleng`, `besi`, `pecah_belah`) dan nominal harga dengan basis **per 100 gram**.
3. **`transaksi`**: Mencatat setiap pengajuan daur ulang (`user_id`, `kategori`, `keterangan`, `berat` dalam gram, `lokasi`, `latitude`, `longitude`, `harga100gr`, `totalharga`, `status`, `foto`, `created_at`).

---

## 3. PEMBAGIAN HAK AKSES (ROLE ACCESS)

Sistem SDU memiliki 3 tingkat akses pengguna:

| Role | Deskripsi Hak Akses |
| :--- | :--- |
| **Publik / Tamu (Guest)** | Dapat melihat Landing Page umum, informasi edukasi seputar daur ulang, statistik global platform, serta mengakses halaman Login dan Registrasi. |
| **Warga (User)** | Memiliki akses ke Dashboard Warga, menginput pengajuan penjemputan sampah, memilih titik peta jemput, melihat riwayat status penjemputan, dan mengubah profil pribadi. |
| **Admin / Pengepul (Admin)** | Memiliki hak penuh operasional: memantau KPI dan analitik, mengubah status transaksi warga, membuka rute Google Maps jemput, menghubungi warga via WhatsApp otomatis, mengedit master tarif harga sampah, serta mengelola data warga terdaftar. |

---

## 4. BEDAH HALAMAN & FITUR SECARA MENDALAM

---

### A. HALAMAN PUBLIK & AUTENTIKASI

#### 1. Landing Page (`/`)
Halaman pembuka utama yang dapat diakses oleh siapa saja tanpa perlu login. Berfungsi sebagai etalase informasi dan edukasi bagi masyarakat.
* **Header & Navigasi Publik:** Menampilkan logo resmi SDU, link informasi, serta tombol untuk masuk (**Login**) atau mendaftar (**Register**).
* **Hero Banner Section:** Gambar visual banner interaktif yang menarik perhatian pengguna dengan ajakan aksi berkontribusi menjaga lingkungan.
* **Section "Tentang SDU":** Penjelasan ringkas mengenai filosofi SDU, apa saja kategori sampah yang diterima (plastik, kardus, botol, kaleng, besi, pecah belah), dan misi sosial ekonominya.
* **Section "Cara Kerja SDU":** 4 tahapan alur praktis bagi warga:
  1. *Pilah Sampah:* Memisahkan sampah bernilai jual di rumah.
  2. *Ajukan Penjemputan:* Memilih jenis sampah, berat perkiraan, dan menandai lokasi rumah pada peta aplikasi.
  3. *Penjemputan & Penimbangan:* Tim pengepul datang langsung ke rumah dan menimbang ulang secara presisi.
  4. *Pencairan Pembayaran:* Warga langsung menerima pembayaran sesuai timbangan.
* **Section "Dampak SDU" (Statistik Real-time):** Kotak metrik dinamis yang mengambil data agregat dari database:
  * *Total Transaksi:* Jumlah penjemputan yang telah berlangsung.
  * *Total Berat Terkumpul:* Akumulasi berat sampah yang berhasil diselamatkan dari TPA (dikonversi otomatis ke satuan **Kg** atau **Ton**).
  * *Total Pengguna Terdaftar:* Jumlah masyarakat yang telah bergabung.
  * *Total Kategori:* Variasi jenis sampah yang dapat didaur ulang.
* **Footer:** Identitas hak cipta, merek SDU, dan tautan ringkas.

---

#### 2. Halaman Login (`/login` & `/admin/login`)
Pintu masuk utama untuk warga maupun admin ke dalam sistem.
* **Header Kartu:** Logo SDU dan sapaan selamat datang.
* **Input Nomor HP:** Menggunakan format nomor telepon aktif (karena nomor HP adalah identitas login utama warga di SDU).
* **Input Password:** Disertai tombol ikon mata (**Show / Hide Password**) untuk memudahkan pengguna melihat kata sandi yang diketik.
* **Tombol Masuk:** Mengirim kredensial ke API backend (`/login`).
* **Pengarah Rute Otomatis (Role-Based Redirect):**
  * Jika akun terdaftar sebagai `admin` $\rightarrow$ langsung diarahkan ke Dashboard Admin (`/admin/dashboard`).
  * Jika akun terdaftar sebagai `user` $\rightarrow$ diarahkan ke Dashboard Warga (`/dashboard`).
* **Tautan Registrasi:** Tombol pintas bagi warga baru yang belum memiliki akun untuk menuju halaman pendaftaran.

---

#### 3. Halaman Registrasi Warga (`/register`)
Formulir pendaftaran bagi warga agar terdata dalam ekosistem SDU.
* **Input Nama Lengkap:** Nama warga yang akan tercantum pada transaksi dan penjemputan.
* **Input Nomor HP (WhatsApp):** Wajib berupa nomor aktif karena akan digunakan oleh tim penjemput untuk koordinasi via WhatsApp.
* **Input Alamat Lengkap:** Alamat tempat tinggal default warga (jalan, nomor rumah, patokan), yang nantinya akan otomatis terisi saat warga membuat transaksi.
* **Input Password & Konfirmasi Password:** Proteksi validasi agar password yang dimasukkan tidak salah ketik.
* **Validasi Sisi Klien:** Pengecekan otomatis agar tidak ada data yang kosong dan memastikan password cocok sebelum dikirim ke backend (`/register`).
* **Tautan Kembali ke Login:** Untuk warga yang ternyata sudah memiliki akun.

---

### B. HALAMAN ROLE PENGGUNA (WARGA)

#### 1. Komponen Navigasi Warga (`Navbar`)
Selalu tampil di bagian atas seluruh halaman warga untuk navigasi yang mulus:
* **Brand Logo SDU:** Tautan cepat di pojok kiri atas untuk langsung kembali ke Beranda Publik (`/`).
* **Menu Navigasi (Pill Bar Role Warga):**
  * **Dashboard Warga:** Halaman utama warga dengan ringkasan saldo, status armada kurir aktif, dan pintasan layanan cepat (`/dashboard`).
  * **Setor Sampah:** Formulir pengajuan penjemputan sampah terpilah mandiri (`/transaksi`).
  * **Riwayat Transaksi:** Riwayat dan pelacakan status pesanan sampah secara real-time (`/riwayat`).
  *(Catatan Desain: Tombol 'Beranda' sengaja ditiadakan dari deretan pill warga agar menu lebih fokus & efisien, karena logo SDU sudah berfungsi sebagai jalan pintas ke Beranda Publik).*
* **Menu Publik (Saat Belum Login):**
  * Menyajikan pintasan bagian landing page: *Katalog Sampah*, *Cara Kerja*, *Dampak Lingkungan*, dan *Testimoni Warga*, serta tombol *Masuk* dan *Daftar Akun*.
* **Widget Profil di Pojok Kanan:**
  * Menampilkan nama warga dan alamat ringkas.
  * Menampilkan foto profil bulat (atau avatar default).
  * **Dropdown Menu Profil:**
    * *Pengaturan Profil:* Menuju halaman ubah data dan foto (`/profil`).
    * *Logout:* Keluar dari sesi aplikasi, membersihkan penyimpanan `localStorage`, dan kembali ke halaman login.

---

#### 2. Dashboard Warga (`/dashboard`)
Pusat kontrol bagi warga setelah berhasil login.
* **Header Sapaan:** Ucapan selamat datang personal (*"Halo, [Nama Warga] 👋"*).
* **3 Kartu Metrik Pribadi:**
  1. *Total Transaksi:* Berapa kali warga telah menyetor sampah.
  2. *Total Berat (Kg):* Total akumulasi kilogram sampah yang telah disetorkan warga.
  3. *Total Pendapatan (Rp):* Total akumulasi uang yang berhasil diperoleh warga dari hasil daur ulang.
* **Section Riwayat Terbaru:** Menampilkan cuplikan ringkas transaksi terakhir milik warga agar warga bisa langsung mengetahui progres setoran terbarunya tanpa harus membuka menu riwayat.

---

#### 3. Halaman Setor Sampah / Input Transaksi (`/transaksi`)
Jantung dari operasional warga untuk menjual sampah daur ulang ke pengepul. Halaman ini dirancang sangat informatif dan memandu:
* **Panduan Step-by-Step Visual (Bagian Atas):**
  Diagram langkah horizontal dengan 5 tahapan jelas:
  1. *Pilih Jenis Sampah*
  2. *Masukkan Berat*
  3. *Lengkapi Data*
  4. *Ajukan Transaksi*
  5. *Tunggu Konfirmasi*
* **Formulir Pengajuan Transaksi (Bagian Bawah):**
  * **Pilihan Kategori Sampah:** Dropdown pilihan jenis sampah (Plastik, Kardus, Botol, Kaleng, Besi, Pecah Belah).
  * **Info Tarif Otomatis:** Saat kategori dipilih, sistem secara otomatis menampilkan tarif per 100 gram dan per kilogram yang sedang berlaku saat itu.
  * **Input Berat Sampah (Kg):** Warga memasukkan perkiraan berat dalam satuan Kilogram.
  * **Kalkulator Pendapatan Otomatis (*Live Calculator*):**
    Sistem secara instan mengonversi berat Kg ke gram dan mengalikannya dengan tarif harga:
    $$\text{Estimasi Payout} = \frac{\text{Berat (gram)}}{100} \times \text{Harga per 100gr}$$
    Warga langsung mengetahui estimasi nominal uang yang akan mereka terima sebelum menekan tombol kirim.
  * **Keterangan Tambahan:** Kolom catatan deskriptif untuk memperjelas kondisi sampah (contoh: *"Kardus indomie 3 ikat, kaleng biskuit lebaran"*).
  * **Alamat Penjemputan:** Otomatis terisi sesuai alamat profil warga, namun warga dapat mengeditnya jika sampah berada di lokasi lain.
  * **Peta Penjemputan Interaktif Leaflet (`MapPicker`):**
    * Peta berbasis OpenStreetMap yang secara otomatis mendeteksi posisi GPS perangkat warga menggunakan *Geolocation API*.
    * Warga dapat mengklik atau menggeser pin marker pada peta untuk menentukan titik koordinat latitude & longitude yang presisi di depan rumah mereka.
  * **Upload Foto Bukti Sampah:** Warga dapat memotret atau memilih berkas foto sampah untuk diunggah sebagai bukti visual bagi pengepul.
  * **Tombol "Ajukan Transaksi":** Memvalidasi kelengkapan data, mengunggah foto ke server, menyimpan data transaksi dengan status awal **"Menunggu"**, lalu mengarahkan warga ke Dashboard.

---

#### 4. Halaman Riwayat Transaksi Warga (`/riwayat`)
Halaman pemantauan komprehensif bagi warga untuk melihat jejak rekam setoran sampah mereka.
* **Header Riwayat:** Informasi umum riwayat transaksi.
* **Empty State:** Jika warga belum pernah bertransaksi, muncul tampilan ramah berisi ikon box dan ajakan untuk mulai menyetor sampah.
* **Grid Kartu Riwayat Transaksi:**
  Setiap transaksi disajikan dalam kartu yang informatif:
  * **Header Kartu:** Kategori sampah, tanggal transaksi, dan badge status berwarna sesuai progres (*Menunggu* / *Diproses* / *Dijemput* / *Selesai*).
  * **Timeline Stepper Status Visual:**
    Progress bar tahapan penjemputan sampah yang menunjukkan di mana posisi proses transaksi saat ini:
    $$\text{Menunggu} \longrightarrow \text{Diproses} \longrightarrow \text{Dijemput} \longrightarrow \text{Selesai}$$
    Titik tahapan yang sudah selesai akan bertanda centang hijau.
  * **Thumbnail Foto Sampah:** Menampilkan foto sampah yang telah diunggah oleh warga saat pengajuan.
  * **Keterangan Sampah:** Catatan deskripsi sampah.
  * **Rincian Berat & Total Uang:** Menampilkan berat dalam format Kilogram dan total rupiah yang didapatkan.
  * **Lokasi Penjemputan:** Alamat tujuan penjemputan.

---

#### 5. Halaman Profil Warga (`/profil`)
Tempat warga mengelola data diri mereka.
* **Cover Banner:** Tampilan grafis modern pada bagian atas halaman.
* **Foto Profil & Tombol Kamera:** Menampilkan foto pengguna saat ini dan tombol untuk mengunggah foto profil baru dari galeri/kamera.
* **Input Nama Lengkap:** Mengubah nama tampilan warga.
* **Input Nomor HP:** Memperbarui nomor telepon yang dapat dihubungi.
* **Input Alamat Rumah:** Mengubah alamat domisili utama.
* **Tombol "Simpan Perubahan":** Menyimpan data dan foto baru ke database serta menyinkronkan data sesi lokal.

---

### C. HALAMAN ROLE PENGELOLA (ADMIN / PENGEPUL)

---

#### 1. Navigasi Samping Admin (`AdminSidebars`)
Sidebar navigasi persisten di sisi kiri untuk mempermudah operasional admin:
* **Identitas Brand:** Logo SDU dan badge penanda "Admin".
* **Menu Utama:**
  * **Dashboard Admin:** Ringkasan statistik dan grafik performa sistem.
  * **Kelola Transaksi:** Daftar seluruh transaksi sampah masuk dari warga.
  * **Kelola Harga:** Master pengaturan tarif beli sampah daur ulang.
  * **Kelola User:** Daftar seluruh akun warga yang terdaftar.
* **Panel Profil Admin (Bawah Sidebar):**
  * Foto profil admin dan nama admin yang bertugas.
  * Tombol menu dropdown untuk pengaturan profil admin dan tombol **Logout**.

---

#### 2. Dashboard Utama Admin (`/admin/dashboard`)
Pusat komando dan pemantauan kinerja harian bagi pihak pengepul.
* **Header Admin:** Sapaan selamat datang ramah kepada admin yang sedang bertugas.
* **4 Kartu KPI Utama Sistem:**
  1. *Total User:* Akumulasi seluruh warga yang telah mendaftar di SDU.
  2. *Total Transaksi:* Jumlah seluruh pengajuan transaksi yang tercatat di sistem.
  3. *Total Berat (Kg):* Total bobot sampah daur ulang yang telah dikumpulkan.
  4. *Total Perputaran Uang (Rp):* Total dana yang telah disalurkan kepada warga.
* **Section Status Data Transaksi (`StatusDataComponent`):**
  Widget ringkasan jumlah transaksi yang dikelompokkan berdasarkan status:
  * Berapa transaksi yang berstatus **Menunggu** (butuh respon admin).
  * Berapa transaksi yang berstatus **Diproses** (sedang dijadwalkan).
  * Berapa transaksi yang berstatus **Dijemput** (kurir sedang di jalan).
  * Berapa transaksi yang berstatus **Selesai** (sudah tuntas ditimbang & dibayar).
* **Section Transaksi Terbaru:** Tabel/daftar 5 transaksi paling baru yang diajukan oleh warga untuk segera ditindaklanjuti.
* **Section User Terbaru:** Daftar 5 warga yang baru saja mendaftar ke platform SDU.
* **Section Grafik Analitik (`CardGrafik`):**
  * **Grafik Batang Transaksi Bulanan (Bar Chart):** Memvisualisasikan tren volume transaksi dari bulan ke bulan (Januari hingga Desember) untuk melihat tren peningkatan partisipasi warga.
  * **Grafik Donat Kategori Sampah (Doughnut Chart):** Menampilkan perbandingan persentase jenis sampah yang paling mendominasi (misalnya: berapa % plastik, kaleng, kardus, dsb.) guna perencanaan kapasitas gudang pengepul.

---

#### 3. Kelola Transaksi Warga (`/admin/transaksi`)
Halaman kerja harian operasional pengepul untuk memproses penjemputan sampah.
* **Penyaring & Pencarian Real-time (`SearchBar`):**
  * *Kolom Pencarian:* Mengetikkan nama warga, nomor HP, atau jenis sampah untuk mencari transaksi secara instan tanpa reload halaman.
  * *Dropdown Filter Status:* Menyaring tampilan hanya transaksi tertentu (misalnya hanya ingin melihat yang berstatus "Menunggu" atau "Dijemput").
* **Grid Kartu Transaksi Admin (`TransactionCard`):**
  Setiap kartu mewakili 1 transaksi penjemputan warga dengan informasi lengkap:
  * **Nama & No HP Warga.**
  * **Dropdown Status Interaktif (`StatusDropdown`):** Admin dapat langsung mengganti status transaksi (misalnya dari *Menunggu* menjadi *Dijemput*). Perubahan status langsung tersimpan ke database secara *real-time*.
  * **Detail Lengkap:** Kategori sampah, keterangan isi sampah, berat dalam Kilogram, estimasi total nominal pembayaran rupiah, lokasi penjemputan, dan tanggal transaksi dibuat.
  * **Foto Sampah Bukti Pengajuan:** Tampilan foto sampah yang diunggah warga untuk verifikasi sebelum dijemput.
* **Dua Tombol Quick Action Logistik (Fitur Unggulan SDU):**
  1. **Tombol "📍 Lihat Lokasi" (`MapsButton`):**
     Ketika tombol ini diklik, browser akan langsung membuka aplikasi **Google Maps** dengan mode navigasi/rute arah jalan (*Directions*) dari lokasi admin menuju koordinat GPS (`latitude` & `longitude`) penjemputan warga. Sopir atau kurir penjemput tidak perlu mengetik alamat secara manual.
  2. **Tombol "💬 WhatsApp" (`WaButton`):**
     Ketika tombol ini diklik, sistem akan otomatis membuka aplikasi WhatsApp web/mobile menuju nomor HP warga dengan **template pesan percakapan otomatis** yang sudah terisi rapi, mencantumkan nama warga, rincian jenis sampah, estimasi berat, total pembayaran, alamat, dan status penjemputan saat ini.

---

#### 4. Kelola Harga Sampah (`/admin/harga`)
Halaman pengelolaan master tarif beli sampah.
* **Header Informasi:** Penjelasan bahwa harga yang diatur di sini akan menjadi acuan perhitungan seluruh transaksi warga di platform.
* **Grid Kartu Kategori Sampah (`CardHarga`):**
  * Terdiri dari 6 kategori utama: **Plastik, Kardus, Botol, Kaleng, Besi, Pecah Belah**.
  * Setiap kartu memiliki ikon ilustratif yang sesuai jenis bahannya.
  * **Input Harga per 100 Gram:** Admin dapat langsung mengubah angka harga per 100 gram pada kolom input.
  * **Kalkulasi Otomatis per Kilogram:** Menampilkan simulasi harga per 1 Kg (dikali 10 secara otomatis) untuk kemudahan membaca rate harga pasaran.
  * **Tombol "Simpan Harga":** Mengirim update ke API backend (`/admin/harga/:id`) untuk memperbarui tarif secara langsung. Semua warga yang membuat transaksi setelahnya akan otomatis mengikuti harga baru ini.

---

#### 5. Kelola User / Warga (`/admin/user`)
Halaman direktori seluruh masyarakat yang menggunakan platform SDU.
* **Bilah Pencarian Warga:** Memungkinkan admin mencari warga berdasarkan nama atau nomor telepon.
* **Grid Kartu Profil Warga (`CardManageUser`):**
  Setiap kartu menampilkan:
  * Foto profil dan nama warga.
  * Nomor telepon.
  * Ringkasan kontribusi warga:
    * *Total Transaksi:* Berapa kali warga tersebut telah berpartisipasi.
    * *Total Berat:* Berapa Kg sampah yang sudah disumbangkan/dijual.
    * *Total Pendapatan:* Berapa total akumulasi uang yang telah diperoleh warga tersebut.
  * **Tombol "Lihat Detail":** Membuka halaman rekam jejak mendalam dari warga yang dipilih.

---

#### 6. Halaman Detail Warga (`/admin/user/:id`)
Halaman audit dan investigasi riwayat transaksi per individu warga.
* **Profil Lengkap Warga:**
  * Foto profil besar, nama lengkap, nomor telepon, dan alamat domisili terdaftar.
  * **Tombol Hubungi WhatsApp:** Menghubungi warga secara personal untuk keperluan verifikasi atau kendala akun.
* **Kartu Ringkasan Akumulasi:** Total transaksi sukses, total kilogram sampah yang disetor, dan total uang yang telah dicairkan ke warga tersebut.
* **Daftar Riwayat Seluruh Transaksi Warga Tersebut:**
  Menampilkan tabel/grid seluruh transaksi yang pernah dilakukan warga tersebut sepanjang waktu, lengkap dengan foto sampah, status masing-masing transaksi, tanggal, dan nominalnya.

---

#### 7. Profil Admin (`/admin/profil`)
Halaman personal untuk pengelola atau staf admin yang bertugas:
* Mengganti nama admin.
* Memperbarui nomor kontak operasional admin.
* Mengunggah foto profil staf admin yang bertugas agar warga dapat mengenali pengelola sistem.

---

## 5. RANGKUMAN FITUR UNGGULAN & INOVASI SISTEM SDU

1. **Kalkulator Transaksi Otomatis (Live Estimation):**
   Warga tidak perlu bingung mengira-ngira nominal uang yang didapat. Cukup pilih kategori dan isi berat, sistem otomatis menghitung rupiah yang akan diterima.
2. **Geolokasi Presisi dengan Peta Interaktif Leaflet:**
   Warga dapat menandai posisi rumah dengan akurasi GPS tinggi, menghilangkan masalah kurir tersesat atau alamat penjemputan yang tidak jelas.
3. **Integrasi Rute Google Maps 1-Klik untuk Kurir Penjemput:**
   Admin atau sopir penjemput cukup menekan tombol *Lihat Lokasi* pada kartu transaksi untuk langsung mendapatkan rute jalan belok-demi-belok (*turn-by-turn navigation*) ke lokasi warga.
4. **Automated WhatsApp Dispatcher:**
   Komunikasi konfirmasi penjemputan dilakukan via WhatsApp otomatis tanpa perlu menyimpan nomor kontak terlebih dahulu atau mengetik pesan panjang dari awal.
5. **Dashboard Visual & Analitik:**
   Grafik batang dan donat mempermudah manajemen memantau kinerja daur ulang, bulan puncak transaksi, serta jenis sampah yang paling berpotensi untuk diolah kembali.
6. **Desain Responsif & Ramah Pengguna:**
   Tata letak telah disesuaikan agar nyaman digunakan baik dari layar laptop/desktop maupun perangkat smartphone.

---

## 6. PANDUAN MENJALANKAN SISTEM SECARA LOKAL

### Prasyarat:
* **Node.js** (versi 18 ke atas) & **npm**.
* **MySQL Server** (melalui Homebrew, XAMPP, atau MySQL Community Server) yang berjalan di `localhost:3306`.

### Langkah-Langkah:
1. **Persiapan Database:**
   * Buat database baru bernama `sdu_db` di MySQL Anda:
     ```bash
     mysql -u root -e "CREATE DATABASE IF NOT EXISTS sdu_db;"
     ```
   * Impor skema dan data awal dari berkas `sdu_db.sql`:
     ```bash
     mysql -u root sdu_db < sdu_db.sql
     ```

2. **Menjalankan Backend (Server API):**
   * Buka terminal dan masuk ke folder `backend`:
     ```bash
     cd backend
     npm install
     npm run dev
     ```
   * Backend akan aktif di: **`http://localhost:5001`** dengan pesan *`Database berhasil terhubung`*.

3. **Menjalankan Frontend (Aplikasi Web):**
   * Buka terminal kedua dan masuk ke folder `my-app`:
     ```bash
     cd my-app
     npm install
     npm run dev
     ```
   * Buka peramban (browser) di alamat: **`http://localhost:5173`**.

4. **Kredensial Login Pengujian:**
   * **Akun Admin:** No HP `083808421427` / Password: `admin`
   * **Akun Warga:** No HP `089633698200` / Password: `user`

---

*Dokumen ini disusun untuk memberikan pemahaman menyeluruh mengenai konsep bisnis, arsitektur perangkat lunak, alur operasional, dan setiap fitur di dalam platform SDU (Sistem Daur Ulang).*

