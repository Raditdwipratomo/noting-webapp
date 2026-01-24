const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const {
  changePasswordValidation,
  loginValidation,
  registerValidation,
} = require("../middleware/authValidation");

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/refresh", authController.refreshToken);

router.use(authenticate);

router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.put(
  "/change-password",
  changePasswordValidation,
  authController.changePassword,
);

module.exports = router;
