const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Silakan login.",
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

module.exports = { authenticate };
