const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== 1. Folder khusus komunitas =====
const uploadDir = path.join(__dirname, "../../images/komunitas");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== 2. Allowed extensions =====
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

// ===== 3. Storage =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    try {
      // ambil username / user id kalau ada
      const userIdentifier =
        req.user?.id ||
        req.body.user_id ||
        "user";

      const uniqueSuffix =
        Date.now() + "-" + Math.round(Math.random() * 1e9);

      const ext = path.extname(file.originalname).toLowerCase();

      cb(null, `komunitas-${userIdentifier}-${uniqueSuffix}${ext}`);
    } catch (err) {
      cb(err);
    }
  },
});

// ===== 4. File filter =====
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    file.mimetype.startsWith("image/") &&
    ALLOWED_EXT.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan!"),
      false
    );
  }
};

// ===== 5. Multer config =====
const uploadKomunitasMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

module.exports = uploadKomunitasMiddleware;