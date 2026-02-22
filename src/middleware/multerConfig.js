const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the directory exists
const uploadDir = path.join(__dirname, "../../images/makanan");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate filename based on food name or detail ID if provided in body, else fallback
    const foodName = req.body.nama_makanan || "resep";
    const sanitizedName = foodName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-") // replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // remove leading/trailing hyphens

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    // Fallback to detailId-timestamp if no food name is provided easily
    if (sanitizedName === "resep" && req.params.detailId) {
      cb(null, `makanan-${req.params.detailId}-${uniqueSuffix}${ext}`);
    } else {
      cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
  },
});

// File filter to allow only image types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});
 
module.exports = upload;
