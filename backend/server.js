require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const mysql = require("mysql2");

["uploads/transaksi", "uploads/profil", "uploads/ktp"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "sdu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("koneksi gagal");
    console.log(err);
    return;
  }
  console.log("Database berhasil terhubung");
  connection.release();

  // Inisialisasi tabel target_bonus dan kolom bonus pada transaksi jika belum ada
  db.query(`
    CREATE TABLE IF NOT EXISTS target_bonus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      min_berat INT DEFAULT 20,
      bonus INT DEFAULT 5000,
      is_active TINYINT(1) DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `, (tbErr) => {
    if (!tbErr) {
      db.query(`
        INSERT INTO target_bonus (id, min_berat, bonus, is_active)
        VALUES (1, 20, 5000, 1)
        ON DUPLICATE KEY UPDATE id=id;
      `);
    }
  });

  db.query("SHOW COLUMNS FROM transaksi LIKE 'bonus'", (colErr, cols) => {
    if (!colErr && cols && cols.length === 0) {
      db.query("ALTER TABLE transaksi ADD COLUMN bonus INT DEFAULT 0 AFTER totalharga");
    }
  });
});

// --- Konfigurasi Redis In-Memory Cache ---
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

let isRedisConnected = false;

redisClient.on("error", (err) => {
  // Safe logging: jika Redis belum aktif, backend tetap berfungsi normal (fallback ke DB)
  console.log("[Redis] Status:", err.message);
  isRedisConnected = false;
});

redisClient.on("connect", () => {
  console.log("Redis Cache berhasil terhubung");
  isRedisConnected = true;
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.log("[Redis] Belum siap (tetap aman, menggunakan fallback DB)");
    isRedisConnected = false;
  }
})();

// Helper fungsi cache dengan penanganan error aman
const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    // Abaikan error cache agar proses utama tidak terganggu
  }
};

const delCache = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    // Abaikan error cache
  }
};

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/transaksi");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const storageProfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profil");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const uploadProfil = multer({
  storage: storageProfil,
});

const upload = multer({
  storage,
});

const storageRegister = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "foto_ktp") {
      cb(null, "uploads/ktp");
    } else {
      cb(null, "uploads/profil");
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const uploadRegister = multer({
  storage: storageRegister,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Format file harus JPG, JPEG, PNG, atau WEBP"));
    }
  },
});

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Backend SDU Berjalan");
});

app.post("/upload-foto", upload.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "foto tidak ditemukan",
    });
  }

  res.json({
    message: "upload foto berhasil",
    filename: req.file.filename,
  });
});

app.get("/transaksi", (req, res) => {
  const sql = "SELECT * FROM transaksi ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data",
      });
    }

    res.json(result);
  });
});

app.get("/transaksi/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT * FROM transaksi WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data",
      });
    }

    res.json(result);
  });
});

app.post("/transaksi", (req, res) => {
  const status = "Menunggu";
  const {
    user_id,
    kategori,
    keterangan,
    berat,
    lokasi,
    latitude,
    longitude,
    harga100gr,
    totalharga,
    bonus,
    foto,
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }

  db.query(
    "SELECT role, status_verifikasi FROM user WHERE id = ?",
    [user_id],
    (userErr, userRows) => {
      if (userErr) {
        console.log(userErr);
        return res.status(500).json({ message: "Gagal memverifikasi status pengguna" });
      }
      if (userRows.length === 0) {
        return res.status(404).json({ message: "Akun pengguna tidak ditemukan" });
      }
      const userAccount = userRows[0];
      if (userAccount.role === "user" && userAccount.status_verifikasi !== "verified") {
        return res.status(403).json({
          message: "Akun Anda belum terverifikasi oleh Admin. Tidak dapat melakukan transaksi.",
        });
      }

      const sql = `INSERT INTO transaksi (user_id,kategori,keterangan,berat,lokasi,latitude,longitude,harga100gr,totalharga,bonus,status,foto) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

      db.query(
        sql,
        [
          user_id,
          kategori,
          keterangan,
          berat,
          lokasi,
          latitude,
          longitude,
          harga100gr,
          totalharga,
          Number(bonus) || 0,
          status,
          foto,
        ],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Gagal menyimpan transaksi",
            });
          }

          res.json({
            message: "Transaksi berhasil disimpan",
          });
        },
      );
    },
  );
});

app.get("/dashboard", (req, res) => {
  const sql = `SELECT COUNT(*) AS totalTransaksi,SUM(berat) AS totalBerat,SUM(totalharga) AS totalPendapatan FROM transaksi`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal mengambil data dashboard",
      });
    }
    res.json(result[0]);
  });
});

app.get("/dashboard/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT COUNT(*) AS totalTransaksi, SUM(berat) AS totalBerat,SUM(totalharga) AS totalPendapatan FROM transaksi WHERE user_id = ? `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data dashboard",
      });
    }

    res.json(result[0]);
  });
});

const uploadRegisterFields = uploadRegister.fields([
  { name: "foto_profil", maxCount: 1 },
  { name: "foto_ktp", maxCount: 1 },
]);

app.post("/register", (req, res) => {
  uploadRegisterFields(req, res, (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({
        message: uploadErr.message || "Gagal mengunggah berkas foto.",
      });
    }

    const { nama, nik, username, no_hp, alamat, password } = req.body;
    const fotoProfilFile = req.files?.foto_profil?.[0];
    const fotoKtpFile = req.files?.foto_ktp?.[0];

    const cleanupFiles = () => {
      if (fotoProfilFile?.path && fs.existsSync(fotoProfilFile.path)) {
        fs.unlinkSync(fotoProfilFile.path);
      }
      if (fotoKtpFile?.path && fs.existsSync(fotoKtpFile.path)) {
        fs.unlinkSync(fotoKtpFile.path);
      }
    };

    if (
      !nama?.trim() ||
      !nik?.trim() ||
      !username?.trim() ||
      !no_hp?.trim() ||
      !alamat?.trim() ||
      !password?.trim()
    ) {
      cleanupFiles();
      return res.status(400).json({
        message: "Semua data formal wajib diisi lengkap.",
      });
    }

    const cleanNik = nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      cleanupFiles();
      return res.status(400).json({
        message: "NIK wajib berupa 16 digit angka sesuai KTP.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUsername)) {
      cleanupFiles();
      return res.status(400).json({
        message:
          "Username harus 3-30 karakter (huruf kecil, angka, titik, atau garis bawah tanpa spasi).",
      });
    }

    if (password.length < 6) {
      cleanupFiles();
      return res.status(400).json({
        message: "Password minimal 6 karakter.",
      });
    }

    if (!fotoProfilFile || !fotoKtpFile) {
      cleanupFiles();
      return res.status(400).json({
        message:
          "Foto Profil dan Foto KTP wajib diunggah untuk proses verifikasi Admin.",
      });
    }

    const cleanPhone = no_hp.trim();

    const checkSql =
      "SELECT id, no_hp, username, nik FROM user WHERE no_hp = ? OR username = ? OR nik = ?";
    db.query(checkSql, [cleanPhone, cleanUsername, cleanNik], (checkErr, existing) => {
      if (checkErr) {
        cleanupFiles();
        console.log(checkErr);
        return res.status(500).json({
          message: "Gagal memeriksa kelengkapan data.",
        });
      }

      if (existing.length > 0) {
        cleanupFiles();
        const dup = existing[0];
        if (dup.nik === cleanNik) {
          return res.status(400).json({ message: "NIK ini sudah terdaftar dalam sistem." });
        }
        if (dup.username === cleanUsername) {
          return res.status(400).json({ message: "Username sudah digunakan, pilih username lain." });
        }
        return res.status(400).json({ message: "Nomor HP sudah terdaftar dalam sistem." });
      }

      const role = "user";
      const statusVerifikasi = "pending";

      const sql = `
        INSERT INTO user
        (
          nama,
          nik,
          username,
          no_hp,
          alamat,
          password,
          role,
          status_verifikasi,
          foto_profil,
          foto_ktp
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `;

      db.query(
        sql,
        [
          nama.trim(),
          cleanNik,
          cleanUsername,
          cleanPhone,
          alamat.trim(),
          password,
          role,
          statusVerifikasi,
          fotoProfilFile.filename,
          fotoKtpFile.filename,
        ],
        (err) => {
          if (err) {
            cleanupFiles();
            console.log(err);
            return res.status(500).json({
              message: "Gagal membuat akun.",
            });
          }

          res.status(201).json({
            message:
              "Registrasi berhasil dikirim! Data dan KTP Anda sedang menunggu verifikasi Admin sebelum dapat login.",
          });
        },
      );
    });
  });
});

app.post("/login", (req, res) => {
  const { identifier, no_hp, username, password } = req.body;
  const loginKey = (identifier || no_hp || username || "").trim();

  if (!loginKey || !password) {
    return res.status(400).json({
      message: "Username / Nomor HP dan Password wajib diisi.",
    });
  }

  const sql = "SELECT * FROM user WHERE (no_hp = ? OR username = ?) AND password = ?";

  db.query(sql, [loginKey, loginKey.toLowerCase(), password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: "Username / Nomor HP atau Password salah.",
      });
    }

    const user = result[0];

    if (user.role === "user") {
      if (user.status_verifikasi === "pending") {
        return res.status(403).json({
          status_verifikasi: "pending",
          message:
            "Akun Anda sedang menunggu verifikasi KTP oleh Admin. Silakan coba login kembali setelah disetujui.",
        });
      }

      if (user.status_verifikasi === "rejected") {
        return res.status(403).json({
          status_verifikasi: "rejected",
          catatan_verifikasi: user.catatan_verifikasi,
          message:
            "Pendaftaran akun Anda ditolak Admin." +
            (user.catatan_verifikasi
              ? ` Alasan: ${user.catatan_verifikasi}`
              : " Data tidak sesuai dengan KTP."),
        });
      }
    }

    res.json({
      message: "Login Berhasil",
      user,
    });
  });
});

app.get("/admin/transaksi/", (req, res) => {
  const sql = `SELECT transaksi.*,user.nama,user.no_hp FROM transaksi JOIN user ON transaksi.user_id = user.id ORDER BY transaksi.id DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data transaksi",
      });
    }

    res.json(result);
  });
});

app.put("/admin/transaksi/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE transaksi SET status = ? WHERE id=?";

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengupdate status ",
      });
    }

    res.json({
      message: "Status berhasil di perbarui",
    });
  });
});

app.get("/admin/dashboard", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM user WHERE role = 'user' AND status_verifikasi = 'verified') AS totalUser,
      (SELECT COUNT(*) FROM user WHERE role = 'user' AND status_verifikasi = 'pending') AS pendingVerifikasi,
      COUNT(*) AS totalTransaksi,
      SUM(berat) AS totalBerat,
      SUM(totalharga) AS totalPendapatan
    FROM transaksi
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data dashboard",
      });
    }

    res.json(result[0]);
  });
});

app.get("/admin/status-transaksi", (req, res) => {
  const sql = `
    SELECT
      status,
      COUNT(*) AS total
    FROM transaksi
    GROUP BY status
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil statistik status",
      });
    }

    res.json(result);
  });
});

app.get("/admin/transaksi-terbaru", (req, res) => {
  const sql = `SELECT transaksi.*, user.nama FROM transaksi JOIN user ON transaksi.user_id = user.id ORDER BY transaksi.created_at DESC LIMIT 5`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal mengambil transaksi terbaru",
      });
    }

    res.json(result);
  });
});

app.get("/admin/user-terbaru", (req, res) => {
  const sql = `
    SELECT id, nama, username, nik, no_hp, status_verifikasi, foto_profil, created_at
    FROM user
    WHERE role = 'user'
    ORDER BY FIELD(status_verifikasi, 'pending', 'verified', 'rejected'), created_at DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil user terbaru",
      });
    }

    res.json(result);
  });
});

app.get("/admin/grafik-transaksi", (req, res) => {
  const sql = `
    SELECT
      MONTH(created_at) AS bulan,
      COUNT(*) AS total
    FROM transaksi
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data grafik",
      });
    }

    res.json(result);
  });
});

app.get("/admin/grafik-kategori", (req, res) => {
  const sql = `
    SELECT
      kategori,
      COUNT(*) AS total
    FROM transaksi
    GROUP BY kategori
    ORDER BY total DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data kategori",
      });
    }

    res.json(result);
  });
});

// ==========================================
// TARGET BONUS ROUTES
// ==========================================
app.get("/target-bonus", async (req, res) => {
  // Cek cache Redis terlebih dahulu
  const cached = await getCache("cache:target_bonus");
  if (cached) {
    return res.json(cached);
  }

  db.query("SELECT * FROM target_bonus WHERE id = 1 LIMIT 1", async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Gagal mengambil data target bonus" });
    }
    const data = result.length === 0 ? { min_berat: 20, bonus: 5000, is_active: 1 } : result[0];
    // Simpan ke Redis selama 1 jam (3600 detik)
    await setCache("cache:target_bonus", data, 3600);
    res.json(data);
  });
});

app.put("/admin/target-bonus", (req, res) => {
  const { min_berat, bonus, is_active } = req.body;
  const sql = `UPDATE target_bonus SET min_berat = ?, bonus = ?, is_active = ? WHERE id = 1`;
  db.query(
    sql,
    [Number(min_berat) || 20, Number(bonus) || 0, is_active ? 1 : 0],
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Gagal memperbarui target bonus" });
      }
      // Hapus cache agar data terbaru langsung terambil
      await delCache("cache:target_bonus");
      res.json({
        message: "Pengaturan target bonus berhasil diperbarui",
        data: {
          min_berat: Number(min_berat) || 20,
          bonus: Number(bonus) || 0,
          is_active: is_active ? 1 : 0,
        },
      });
    }
  );
});

app.get("/harga", async (req, res) => {
  // Cek cache Redis terlebih dahulu
  const cached = await getCache("cache:harga_sampah");
  if (cached) {
    return res.json(cached);
  }

  const sql = "SELECT * FROM harga_sampah";
  db.query(sql, async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "gagal mengambil data harga",
      });
    }

    // Simpan ke Redis selama 1 jam (3600 detik)
    await setCache("cache:harga_sampah", result, 3600);
    res.json(result);
  });
});

app.put("/harga/:id", (req, res) => {
  const { id } = req.params;
  const { harga } = req.body;

  const sql = "UPDATE harga_sampah SET harga = ? WHERE id = ?";

  db.query(sql, [harga, id], async (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengupdate harga",
      });
    }

    // Invalidasi cache harga sampah di Redis
    await delCache("cache:harga_sampah");

    res.json({
      message: "Harga berhasil di perbarui",
    });
  });
});

app.get("/admin/harga", (req, res) => {
  const sql = "SELECT * FROM harga_sampah ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data harga",
      });
    }

    res.json(result);
  });
});

app.get("/admin/harga/logs", (req, res) => {
  const sql = "SELECT * FROM log_harga ORDER BY created_at DESC, id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal mengambil riwayat log tarif",
      });
    }

    res.json(result);
  });
});

app.post("/admin/harga", (req, res) => {
  const { kategori, harga } = req.body;
  if (!kategori?.trim() || harga === undefined || Number(harga) < 0) {
    return res.status(400).json({
      message: "Nama kategori dan tarif valid wajib diisi.",
    });
  }

  db.query(
    "INSERT INTO harga_sampah (kategori, harga) VALUES (?, ?)",
    [kategori.trim().toLowerCase().replace(/\s+/g, "_"), Number(harga)],
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Gagal menambahkan kategori." });
      }

      // Invalidasi cache harga sampah di Redis
      await delCache("cache:harga_sampah");

      res.status(201).json({
        message: "Kategori baru berhasil ditambahkan.",
        id: result.insertId,
      });
    }
  );
});

app.put("/admin/harga/:id", (req, res) => {
  const { id } = req.params;
  const { harga, diubah_oleh, role } = req.body;
  const newPrice = Number(harga);

  db.query("SELECT kategori, harga FROM harga_sampah WHERE id = ?", [id], (selErr, rows) => {
    if (selErr) {
      console.log(selErr);
      return res.status(500).json({ message: "Gagal memeriksa data harga" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: "Kategori harga tidak ditemukan" });
    }

    const oldRow = rows[0];
    const oldPrice = Number(oldRow.harga);

    db.query("UPDATE harga_sampah SET harga = ? WHERE id = ?", [newPrice, id], async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Gagal mengupdate harga",
        });
      }

      // Invalidasi cache harga sampah di Redis
      await delCache("cache:harga_sampah");

      if (oldPrice !== newPrice) {
        const logSql = `
          INSERT INTO log_harga (kategori, harga_lama, harga_baru, diubah_oleh, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(
          logSql,
          [
            oldRow.kategori,
            oldPrice,
            newPrice,
            diubah_oleh || "Admin Utama",
            role || "Admin Operasional",
          ],
          (logErr) => {
            if (logErr) console.log("Gagal mencatat log harga:", logErr);
          }
        );
      }

      res.json({
        message: "Harga berhasil di update",
      });
    });
  });
});

app.get("/admin/user", (req, res) => {
  const sql = `
    SELECT
      user.id,
      user.nama,
      user.nik,
      user.username,
      user.no_hp,
      user.alamat,
      user.foto_profil,
      user.foto_ktp,
      user.status_verifikasi,
      user.catatan_verifikasi,
      user.created_at,
      COUNT(transaksi.id) AS totalTransaksi,
      COALESCE(SUM(transaksi.berat), 0) AS totalBerat,
      COALESCE(SUM(transaksi.totalharga), 0) AS totalPendapatan
    FROM user
    LEFT JOIN transaksi ON user.id = transaksi.user_id
    WHERE user.role = 'user'
    GROUP BY user.id
    ORDER BY FIELD(user.status_verifikasi, 'pending', 'verified', 'rejected'), user.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data user",
      });
    }

    res.json(result);
  });
});

app.get("/admin/user/:id", (req, res) => {
  const { id } = req.params;

  const sqlUser = `
  SELECT
    user.id,
    user.nama,
    user.nik,
    user.username,
    user.no_hp,
    user.alamat,
    user.foto_profil,
    user.foto_ktp,
    user.status_verifikasi,
    user.catatan_verifikasi,
    user.created_at,
    COUNT(transaksi.id) AS totalTransaksi,
    COALESCE(SUM(transaksi.berat),0) AS totalBerat,
    COALESCE(SUM(transaksi.totalharga),0) AS totalPendapatan
  FROM user
  LEFT JOIN transaksi
    ON user.id = transaksi.user_id
  WHERE user.id = ?
  GROUP BY user.id
`;

  const sqlTransaksi = `
    SELECT *
    FROM transaksi
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sqlUser, [id], (err, userResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal mengambil data user",
      });
    }

    db.query(sqlTransaksi, [id], (err, transaksiResult) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Gagal mengambil transaksi user",
        });
      }

      res.json({
        user: userResult[0],
        transaksi: transaksiResult,
      });
    });
  });
});

app.put("/admin/user/:id/verifikasi", (req, res) => {
  const { id } = req.params;
  const { status_verifikasi, catatan_verifikasi } = req.body;

  if (!["verified", "rejected", "pending"].includes(status_verifikasi)) {
    return res.status(400).json({
      message: "Status verifikasi tidak valid.",
    });
  }

  const sql = `
    UPDATE user
    SET status_verifikasi = ?, catatan_verifikasi = ?
    WHERE id = ? AND role = 'user'
  `;

  db.query(sql, [status_verifikasi, catatan_verifikasi || null, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal memperbarui status verifikasi user",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Akun warga tidak ditemukan",
      });
    }

    const msgMap = {
      verified: "Akun warga berhasil diverifikasi dan kini dapat login serta bertransaksi.",
      rejected: "Pendaftaran akun warga telah ditolak.",
      pending: "Status akun dikembalikan ke menunggu verifikasi.",
    };

    res.json({
      message: msgMap[status_verifikasi],
      status_verifikasi,
      catatan_verifikasi: catatan_verifikasi || null,
    });
  });
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      id,
      nama,
      nik,
      username,
      no_hp,
      alamat,
      foto_profil,
      foto_ktp,
      status_verifikasi,
      catatan_verifikasi
    FROM user
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil profil",
      });
    }

    res.json(result[0]);
  });
});

app.put("/user/:id", (req, res) => {
  const { id } = req.params;

  const { nama, no_hp, alamat, foto_profil } = req.body;

  const sql = `
    UPDATE user
    SET
      nama = ?,
      no_hp = ?,
      alamat = ?,
      foto_profil = ?
    WHERE id = ?
  `;

  db.query(sql, [nama, no_hp, alamat, foto_profil, id], (err) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal update profil",
      });
    }

    res.json({
      message: "Profil berhasil diperbarui",
    });
  });
});

app.post("/upload-profil", uploadProfil.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Foto tidak ditemukan",
    });
  }

  res.json({
    filename: req.file.filename,
  });
});

app.get("/statistik-landing-page", (req, res) => {
  const sql = `SELECT
  (SELECT COUNT(*) FROM transaksi) AS totalTransaksi,
  (SELECT COALESCE(SUM(berat),0) FROM transaksi) AS totalBerat,
  (SELECT COUNT(*) FROM user WHERE role = 'user' AND status_verifikasi = 'verified') AS totalPengguna
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Gagal mengambil data statistik landing page",
      });
    }
    // Ambil hasil query (baris pertama)
    const dataStatistik = result[0];

    // Tambahkan totalKategori secara statis (misalnya 5 kategori)
    dataStatistik.totalKategori = 5;
    res.json(result[0]);
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server Berjalan di port ${PORT}`);
});
