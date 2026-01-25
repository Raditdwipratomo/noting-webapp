const { body, param, validationResult } = require("express-validator");

/**
 * Middleware handler untuk error validasi
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

const createAnakValidation = [
  body("user_id")
    .notEmpty()
    .withMessage("User ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("User ID harus berupa angka"),

  body("nama_anak")
    .trim()
    .notEmpty()
    .withMessage("Nama anak wajib diisi")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nama anak harus 3–100 karakter"),

  body("jenis_kelamin")
    .notEmpty()
    .withMessage("Jenis kelamin wajib diisi")
    .isIn(["L", "P"])
    .withMessage("Jenis kelamin harus L (Laki-laki) atau P (Perempuan)"),

  body("tanggal_lahir")
    .notEmpty()
    .withMessage("Tanggal lahir wajib diisi")
    .isISO8601()
    .withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();

      if (birthDate >= today) {
        throw new Error("Tanggal lahir tidak boleh hari ini atau di masa depan");
      }
      return true;
    }),

  body("foto_profil")
    .optional()
    .isString()
    .withMessage("Foto profil harus berupa string"),

  body("status_aktif")
    .optional()
    .isBoolean()
    .withMessage("Status aktif harus boolean"),

  handleValidationErrors,
];

const updateAnakValidation = [
  param("anak_id")
    .isInt({ min: 1 })
    .withMessage("Anak ID harus berupa angka"),

  body("nama_anak")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Nama anak harus 3–100 karakter"),

  body("jenis_kelamin")
    .optional()
    .isIn(["L", "P"])
    .withMessage("Jenis kelamin harus L atau P"),

  body("tanggal_lahir")
    .optional()
    .isISO8601()
    .withMessage("Format tanggal lahir tidak valid")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();

      if (birthDate >= today) {
        throw new Error("Tanggal lahir tidak boleh di masa depan");
      }
      return true;
    }),

  body("foto_profil")
    .optional()
    .isString()
    .withMessage("Foto profil harus berupa string"),

  body("status_aktif")
    .optional()
    .isBoolean()
    .withMessage("Status aktif harus boolean"),

  handleValidationErrors,
];

const anakIdParamValidation = [
  param("anak_id")
    .isInt({ min: 1 })
    .withMessage("Anak ID tidak valid"),
  handleValidationErrors,
];

module.exports = {
  createAnakValidation,
  updateAnakValidation,
  anakIdParamValidation,
};
