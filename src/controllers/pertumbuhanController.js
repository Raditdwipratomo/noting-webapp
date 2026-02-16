const PertumbuhanService = require("../services/pertumbuhanService");
const AnakService = require("../services/anakService");
const StuntingDetectionService = require("../services/stuntingDetectionService");
const { successResponse } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

class PertumbuhanController {
  /**
   * Create new growth record for a child
   * POST /anak/:anakId/pertumbuhan
   */
  async create(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      // Create pertumbuhan record
      const pertumbuhan = await PertumbuhanService.create(anakId, req.body);

      // Auto-detect stunting status
      const diagnosaResult = await StuntingDetectionService.detectStunting(
        pertumbuhan,
        anak,
      );

      // Save diagnosa
      await StuntingDetectionService.saveDiagnosa(
        anakId,
        pertumbuhan.id_pertumbuhan,
        diagnosaResult,
      );

      return successResponse(
        res,
        {
          pertumbuhan,
          diagnosa: diagnosaResult,
        },
        "Data pertumbuhan berhasil ditambahkan dan dianalisis",
        StatusCodes.CREATED,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all growth records for a child
   * GET /anak/:anakId/pertumbuhan
   */
  async getAll(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;
      const { limit, offset, orderBy } = req.query;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      console.log(anak, userId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const result = await PertumbuhanService.getByAnakId(anakId, {
        limit,
        offset,
        orderBy,
      });

      return successResponse(res, result, "Data pertumbuhan berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest growth record for a child
   * GET /anak/:anakId/pertumbuhan/latest
   */
  async getLatest(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const pertumbuhan = await PertumbuhanService.getLatest(anakId);

      if (!pertumbuhan) {
        return successResponse(res, null, "Belum ada data pertumbuhan");
      }

      return successResponse(
        res,
        pertumbuhan,
        "Data pertumbuhan terbaru berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get chart data for growth visualization
   * GET /anak/:anakId/pertumbuhan/chart
   */
  async getChartData(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;
      const { months } = req.query;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const chartData = await PertumbuhanService.getChartData(anakId, {
        months: parseInt(months) || 12,
      });

      return successResponse(res, chartData, "Data chart berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get growth statistics
   * GET /anak/:anakId/pertumbuhan/statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const statistics = await PertumbuhanService.getStatistics(anakId);

      return successResponse(
        res,
        statistics,
        "Statistik pertumbuhan berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single growth record
   * GET /anak/:anakId/pertumbuhan/:pertumbuhanId
   */
  async getById(req, res, next) {
    try {
      const { anakId, pertumbuhanId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const pertumbuhan = await PertumbuhanService.getById(pertumbuhanId);

      return successResponse(
        res,
        pertumbuhan,
        "Data pertumbuhan berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update growth record
   * PUT /anak/:anakId/pertumbuhan/:pertumbuhanId
   */
  async update(req, res, next) {
    try {
      const { anakId, pertumbuhanId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const pertumbuhan = await PertumbuhanService.update(
        pertumbuhanId,
        req.body,
      );

      return successResponse(
        res,
        pertumbuhan,
        "Data pertumbuhan berhasil diupdate",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete growth record
   * DELETE /anak/:anakId/pertumbuhan/:pertumbuhanId
   */
  async delete(req, res, next) {
    try {
      const { anakId, pertumbuhanId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const result = await PertumbuhanService.delete(pertumbuhanId);

      return successResponse(res, result, "Data pertumbuhan berhasil dihapus");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PertumbuhanController();
