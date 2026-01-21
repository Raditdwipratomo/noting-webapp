-- ============================================
-- DATABASE SCHEMA: APLIKASI PENCEGAHAN STUNTING
-- ============================================

-- 1. TABEL USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL ANAK
CREATE TABLE anak (
    anak_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_anak VARCHAR(100) NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL COMMENT 'L=Laki-laki, P=Perempuan',
    tanggal_lahir DATE NOT NULL,
    foto_profil VARCHAR(255),
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tanggal_lahir (tanggal_lahir)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL PERTUMBUHAN ANAK
CREATE TABLE pertumbuhan_anak (
    id_pertumbuhan INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    tanggal_pencatatan DATE NOT NULL,
    berat_badan_kg DECIMAL(5,2) NOT NULL COMMENT 'dalam kilogram',
    tinggi_badan_cm DECIMAL(5,2) NOT NULL COMMENT 'dalam centimeter',
    lingkar_lengan_atas_cm DECIMAL(5,2) COMMENT 'dalam centimeter',
    lingkar_kepala_cm DECIMAL(5,2) COMMENT 'penting untuk anak <2 tahun',
    kategori VARCHAR(50) COMMENT 'sangat buruk, buruk,normal, baik, sangat baik',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    UNIQUE KEY unique_pencatatan (anak_id, tanggal_pencatatan),
    INDEX idx_anak_tanggal (anak_id, tanggal_pencatatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL STANDAR WHO
CREATE TABLE standar_who (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    usia_bulan INT NOT NULL COMMENT 'usia dalam bulan (0-60)',
    
    -- ========================================
    -- STANDAR TINGGI BADAN (TB/U)
    -- Height-for-Age
    -- ========================================
    tb_minus_3sd DECIMAL(5,2) COMMENT 'Z-score -3SD (sangat pendek)',
    tb_minus_2sd DECIMAL(5,2) COMMENT 'Z-score -2SD (pendek/stunting)',
    tb_median DECIMAL(5,2) COMMENT 'Z-score 0 (median)',
    tb_plus_2sd DECIMAL(5,2) COMMENT 'Z-score +2SD, (tinggi)'
    tb_plus_3sd DECIMAL(5,2) COMMENT 'Z-score +3SD (sangat tinggi)',
    
    -- ========================================
    -- STANDAR BERAT BADAN (BB/U)
    -- Weight-for-Age
    -- ========================================
    bb_minus_3sd DECIMAL(5,2) COMMENT 'Z-score -3SD (gizi buruk)',
    bb_minus_2sd DECIMAL(5,2) COMMENT 'Z-score -2SD (gizi kurang)',
    bb_median DECIMAL(5,2) COMMENT 'Z-score 0 (median)',
    bb_plus_2sd DECIMAL(5,2) COMMENT 'Z-score +2SD (gizi lebih)',
    bb_plus_3sd DECIMAL(5,2) COMMENT 'Z-score +3SD (obesitas)',
    
    -- ========================================
    -- STANDAR BERAT BADAN per TINGGI BADAN (BB/TB)
    -- Weight-for-Height (untuk deteksi wasting)
    -- PENTING: Ini berbeda untuk setiap tinggi badan, bukan usia
    -- Tabel terpisah lebih baik (lihat standar_who_bb_tb)
    -- ========================================
    
    -- ========================================
    -- STANDAR LINGKAR KEPALA (LK/U)
    -- Head Circumference-for-Age
    -- PENTING untuk anak 0-36 bulan (deteksi mikrosefali/makrosefali)
    -- ========================================
    lk_minus_3sd DECIMAL(5,2) COMMENT 'Z-score -3SD (mikrosefali berat)',
    lk_minus_2sd DECIMAL(5,2) COMMENT 'Z-score -2SD (mikrosefali)',
    lk_median DECIMAL(5,2) COMMENT 'Z-score 0 (median)',
    lk_plus_2sd DECIMAL(5,2) COMMENT 'Z-score +2SD (makrosefali)',
    lk_plus_3sd DECIMAL(5,2) COMMENT 'Z-score +3SD (makrosefali berat)',
    
    -- ========================================
    -- STANDAR LINGKAR LENGAN ATAS (LILA/U)
    -- Mid-Upper Arm Circumference-for-Age
    -- PENTING untuk screening malnutrisi akut
    -- ========================================
    lila_minus_3sd DECIMAL(5,2) COMMENT 'Z-score -3SD (malnutrisi akut berat)',
    lila_minus_2sd DECIMAL(5,2) COMMENT 'Z-score -2SD (malnutrisi akut)',
    lila_median DECIMAL(5,2) COMMENT 'Z-score 0 (median)',
    lila_plus_2sd DECIMAL(5,2) COMMENT 'Z-score +2SD',
    lila_plus_3sd DECIMAL(5,2) COMMENT 'Z-score +3SD',
    
    UNIQUE KEY unique_standar (jenis_kelamin, usia_bulan),
    INDEX idx_jk_usia (jenis_kelamin, usia_bulan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL RIWAYAT DIAGNOSA
CREATE TABLE riwayat_diagnosa (
    id_diagnosa INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    pertumbuhan_id INT NOT NULL,
    tanggal_diagnosa DATE NOT NULL,
    status_stunting VARCHAR(50) COMMENT 'normal/berisiko/stunting/severely_stunted',
    z_score_tinggi_badan DECIMAL(5,2) COMMENT 'Z-score TB/U',
    z_score_berat_badan DECIMAL(5,2) COMMENT 'Z-score BB/U',
    z_score_berat_tinggi DECIMAL(5,2) COMMENT 'Z-score BB/TB',
    rekomendasi_tindakan TEXT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    FOREIGN KEY (pertumbuhan_id) REFERENCES pertumbuhan_anak(id_pertumbuhan) ON DELETE CASCADE,
    INDEX idx_anak_tanggal (anak_id, tanggal_diagnosa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL RENCANA GIZI MINGGUAN
CREATE TABLE rencana_gizi_mingguan (
    id_rencana INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    minggu_ke INT NOT NULL COMMENT 'minggu ke-N sejak tracking dimulai',
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    INDEX idx_anak_minggu (anak_id, minggu_ke),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL REKOMENDASI HARIAN
CREATE TABLE rekomendasi_harian (
    id_rekomendasi_harian INT AUTO_INCREMENT PRIMARY KEY,
    id_rencana INT NOT NULL,
    anak_id INT NOT NULL,
    hari_ke INT NOT NULL COMMENT 'hari ke-N sejak tracking dimulai',
    tanggal DATE NOT NULL,
    progress_harian INT DEFAULT 0 ,
    jumlah_makanan_total INT DEFAULT 7,
    status ENUM('belum_dimulai', 'sedang_berjalan', 'selesai') DEFAULT 'belum_dimulai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rencana) REFERENCES rencana_gizi_mingguan(id_rencana) ON DELETE CASCADE,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    UNIQUE KEY unique_hari (anak_id, hari_ke),
    INDEX idx_tanggal (tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABEL DETAIL MAKANAN HARIAN
CREATE TABLE detail_makanan_harian (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_rekomendasi_harian INT NOT NULL,
    urutan_makanan INT NOT NULL COMMENT '1-7 untuk 7 kali makan',
    waktu_makan ENUM('susu_pagi', 'makan_pagi', 'snack_pagi', 'makan_siang', 'snack_sore', 'makan_malam', 'susu_malam') NOT NULL,
    status_konsumsi BOOLEAN DEFAULT FALSE COMMENT 'true=sudah, false=belum',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rekomendasi_harian) REFERENCES rekomendasi_harian(id_rekomendasi_harian) ON DELETE CASCADE,
    INDEX idx_rekomendasi_urutan (id_rekomendasi_harian, urutan_makanan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABEL NUTRISI MAKANAN
CREATE TABLE nutrisi_makanan (
    id_nutrisi INT AUTO_INCREMENT PRIMARY KEY
    id_detail_makanan INT NOT NULL
    protein_gram DECIMAL(5,2),
    lemak_gram DECIMAL(5,2),
    karbohidrat_gram DECIMAL(5,2),
    kalsium_mg DECIMAL(6,2),
    zat_besi_mg DECIMAL(5,2),
    zinc_mg DECIMAL(5,2),
    vitamin_a_iu DECIMAL(6,2),
    vitamin_d_iu DECIMAL(6,2),
    vitamin_c_mg DECIMAL(5,2),
    kalori_total INT,
    catatan TEXT,
    FOREIGN KEY (id_detail_makanan) REFERENCES detail_makanan_harian(id_detail) ON DELETE CASCADE,
    UNIQUE KEY unique_nutrisi (id_detail_makanan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. TABEL REMINDER MAKAN
CREATE TABLE reminder_makan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    id_detail_makanan INT,
    waktu_reminder TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    tipe_notifikasi ENUM('push', 'email', 'whatsapp', 'sms') DEFAULT 'push',
    pesan_custom TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    FOREIGN KEY (id_detail_makanan) REFERENCES detail_makanan_harian(id_detail) ON DELETE SET NULL,
    INDEX idx_anak_aktif (anak_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 16. TABEL ARTIKEL EDUKASI
-- CREATE TABLE artikel_edukasi (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     judul VARCHAR(255) NOT NULL,
--     slug VARCHAR(255) UNIQUE NOT NULL,
--     konten LONGTEXT NOT NULL,
--     kategori ENUM('stunting', 'gizi', 'resep', 'tips', 'kesehatan') NOT NULL,
--     thumbnail VARCHAR(255),
--     view_count INT DEFAULT 0,
--     is_published BOOLEAN DEFAULT TRUE,
--     published_at TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_kategori (kategori),
--     INDEX idx_published (is_published, published_at),
--     FULLTEXT idx_judul_konten (judul, konten)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. TABEL ALERGI ANAK
CREATE TABLE alergi_anak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    nama_alergen VARCHAR(100) NOT NULL COMMENT 'misal: susu, telur, kacang',
    tingkat_keparahan ENUM('ringan', 'sedang', 'berat') DEFAULT 'sedang',
    deskripsi TEXT,
    tanggal_ditemukan DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(anak_id) ON DELETE CASCADE,
    INDEX idx_anak (anak_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;