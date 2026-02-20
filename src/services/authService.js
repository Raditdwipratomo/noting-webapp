const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} = require("../middleware/errors");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

class AuthService {
  async register(userData) {
    try {
      const { username, email, password, nama_lengkap, no_telepon, alamat } =
        userData;

      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        throw new ConflictError("User's already exists", 409);
      }

      const user = await User.create({
        username,
        email,
        password,
        nama_lengkap,
        no_telepon,
        alamat,
      });

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundError("User not found", 404);
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new UnauthorizedError("Email atau Password salah", 401);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);

      const user = await User.findByPk(decoded.user_id);

      if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new NotFoundError("User tidak ditemukan", 404);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new NotFoundError("User tidak ditemukan", 404);
      }

      delete updateData.username;
      delete updateData.password;
      delete updateData.email;

      await user.update(updateData);

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new NotFoundError("User tidak ditemukan");
      }

      const isPasswordValid = user.comparePassword(oldPassword);

      if (!isPasswordValid) {
        throw new UnauthorizedError("Password lama salah");
      }

      await user.update({ password: newPassword });

      return { message: "Password berhasil diubah" };
    } catch (error) {
      throw error;
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ user_id: user.user_id, type: "refresh" }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError("Invalid Token");
    }
  }
}

module.exports = new AuthService();
