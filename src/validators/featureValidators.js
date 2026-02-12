const { body, param } = require("express-validator");

/**
 * Validation rules for Gizi (Nutrition) endpoints
 */
const giziValidator = {
  /**
   * Validate anakId param
   */
  paramAnakId: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),
  ],

  /**
   * Validate update makanan status
   */
  updateMakanan: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    param("detailId")
      .isInt({ min: 1 })
      .withMessage("ID detail makanan tidak valid"),

    body("status_konsumsi")
      .notEmpty()
      .withMessage("Status konsumsi wajib diisi")
      .isBoolean()
      .withMessage("Status konsumsi harus boolean"),
  ],

  /**
   * Validate daily recommendation param
   */
  dailyRecommendation: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    param("hariKe")
      .isInt({ min: 1 })
      .withMessage("Hari ke harus angka positif"),
  ],
};

/**
 * Validation rules for Reminder endpoints
 */
const reminderValidator = {
  /**
   * Validate create reminder request
   */
  create: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    body("waktu_reminder")
      .notEmpty()
      .withMessage("Waktu reminder wajib diisi")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
      .withMessage("Format waktu tidak valid (HH:MM atau HH:MM:SS)"),

    body("tipe_notifikasi")
      .optional()
      .isIn(["push", "email", "whatsapp", "sms"])
      .withMessage("Tipe notifikasi harus salah satu dari: push, email, whatsapp, sms"),

    body("pesan_custom")
      .optional()
      .isLength({ max: 255 })
      .withMessage("Pesan custom maksimal 255 karakter"),

    body("id_detail_makanan")
      .optional()
      .isInt({ min: 1 })
      .withMessage("ID detail makanan tidak valid"),
  ],

  /**
   * Validate update reminder request
   */
  update: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    param("reminderId")
      .isInt({ min: 1 })
      .withMessage("ID reminder tidak valid"),

    body("waktu_reminder")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
      .withMessage("Format waktu tidak valid"),

    body("tipe_notifikasi")
      .optional()
      .isIn(["push", "email", "whatsapp", "sms"])
      .withMessage("Tipe notifikasi tidak valid"),

    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("Status aktif harus boolean"),

    body("pesan_custom")
      .optional()
      .isLength({ max: 255 })
      .withMessage("Pesan custom maksimal 255 karakter"),
  ],
};

/**
 * Validation rules for Alergi (Allergy) endpoints
 */
const alergiValidator = {
  /**
   * Validate create alergi request
   */
  create: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    body("nama_alergen")
      .notEmpty()
      .withMessage("Nama alergen wajib diisi")
      .isLength({ min: 1, max: 100 })
      .withMessage("Nama alergen harus 1-100 karakter"),

    body("tingkat_keparahan")
      .optional()
      .isIn(["ringan", "sedang", "berat"])
      .withMessage("Tingkat keparahan harus salah satu dari: ringan, sedang, berat"),

    body("deskripsi")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Deskripsi maksimal 500 karakter"),

    body("tanggal_ditemukan")
      .optional()
      .isDate()
      .withMessage("Format tanggal tidak valid"),
  ],

  /**
   * Validate update alergi request
   */
  update: [
    param("anakId")
      .isInt({ min: 1 })
      .withMessage("ID anak tidak valid"),

    param("alergiId")
      .isInt({ min: 1 })
      .withMessage("ID alergi tidak valid"),

    body("nama_alergen")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("Nama alergen harus 1-100 karakter"),

    body("tingkat_keparahan")
      .optional()
      .isIn(["ringan", "sedang", "berat"])
      .withMessage("Tingkat keparahan tidak valid"),

    body("deskripsi")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Deskripsi maksimal 500 karakter"),
  ],
};

module.exports = {
  giziValidator,
  reminderValidator,
  alergiValidator,
};
