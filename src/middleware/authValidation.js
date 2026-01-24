const { body, validationResult } = require("express-validator");

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

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username harus antara 3-50 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username hanya boleh huruf, angka, dan underscore"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password harus mengandung huruf besar, huruf kecil, dan angka",
    ),

  body("nama_lengkap")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Nama lengkap harus antara 3-100 karakter"),

  body("no_telepon")
    .optional()
    .trim()
    .matches(/^[0-9+\-() ]+$/)
    .withMessage("Format nomor telepon tidak valid"),

  handleValidationErrors,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password tidak boleh kosong"),

  handleValidationErrors,
];

/**
 * Change password validation rules
 */
const changePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Password lama tidak boleh kosong"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password baru minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password baru harus mengandung huruf besar, huruf kecil, dan angka",
    ),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
};
