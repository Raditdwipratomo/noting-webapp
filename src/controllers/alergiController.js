const AlergiService = require("../services/alergiService");
const AnakService = require("../services/anakService");
const { successResponse } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

class AlergiController {
  async create(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const alergi = await AlergiService.create(anakId, req.body);

      return successResponse(
        res,
        alergi,
        "Data alergi berhasil ditambahkan",
        StatusCodes.CREATED,
      );
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const allergies = await AlergiService.getByAnakId(anakId);

      return successResponse(res, allergies, "Data alergi berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { anakId, alergiId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const alergi = await AlergiService.update(alergiId, req.body);

      return successResponse(res, alergi, "Data alergi berhasil di update");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { anakId, alergiId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const result = await AlergiService.delete(alergiId);

      return successResponse(res, result, "Data alergi berhasil dihapus");
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const summary = await AlergiService.getSummary(anakId);

      return successResponse(res, summary, "Ringkasan alergi berhasil diambil");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlergiController();
