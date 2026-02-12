const StuntingDetectionService = require("../services/stuntingDetectionService");
const AnakService = require("../services/anakService");
const PertumbuhanService = require("../services/pertumbuhanService");
const { successResponse } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

class DiagnosaController {
  /**
   * Get diagnosa history for a child
   * GET /anak/:anakId/diagnosa
   */
  async getRiwayat(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;
      const { limit } = req.query;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const riwayat = await StuntingDetectionService.getRiwayatDiagnosa(
        anakId,
        parseInt(limit) || 10,
      );

      return successResponse(res, riwayat, "Riwayat diagnosa berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest diagnosa for a child
   * GET /anak/:anakId/diagnosa/latest
   */

  async getLatest(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const riwayat = await StuntingDetectionService.getRiwayatDiagnosa(
        anakId,
        1,
      );

      const latest = riwayat.length > 0 ? riwayat[0] : null;

      if (!latest) {
        return successResponse(res, null, "Belum ada diagnosa untuk anak ini");
      }

      return successResponse(res, latest, "Diagnosa terbaru berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger manual stunting analysis
   * POST /anak/:anakId/diagnosa/analyze
   */
  async analyze(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const latestPertumbuhan = await PertumbuhanService.getLatest(anakId);

      if (!latestPertumbuhan) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message:
            "Tidak ada data pertumbuhan untuk dianalisis. Silakan input data pertumbuhan terlebih dahulu",
        });
      }

      const diagnosaResult = await StuntingDetectionService.detectStunting(
        latestPertumbuhan,
        anak,
      );

      const savedDiagnosa = await StuntingDetectionService.saveDiagnosa(
        anakId,
        latestPertumbuhan.id_pertumbuhan,
        diagnosaResult,
      );

      return successResponse(res, {
        diagnosa: diagnosaResult,
        pertumbuhan_analyzed: {
          tanggal: latestPertumbuhan.tanggal_pencatatan,
          berat_badan_kg: latestPertumbuhan.berat_badan_kg,
          tinggi_badan_cm: latestPertumbuhan.tinggi_badan_cm,
          lingkar_lengan_atas_cm: latestPertumbuhan.lingkar_lengan_atas_cm,
          lingkar_kepala_cm: latestPertumbuhan.lingkar_kepala_cm,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get diagnosa summary/statistics
   * GET /anak/:anakId/diagnosa/summary
   */

  async getSummary(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const riwayat = await StuntingDetectionService.getRiwayatDiagnosa(
        anakId,
        100,
      );

      if (riwayat.length === 0) {
        return successResponse(
          res,
          {
            total_diagnosa: 0,
            status_counts: {},
            trend: null,
          },
          "Belum ada data diagnosa",
        );
      }

      // Count status occurrences
      const statusCounts = riwayat.reduce((acc, d) => {
        acc[d.status_stunting] = (acc[d.status_stunting] || 0) + 1;
        return acc;
      }, {});

      // Determine trend (comparing latest with earliest)
      let trend = null;
      if (riwayat.length >= 2) {
        const latest = riwayat[0];
        const earliest = riwayat[riwayat.length - 1];

        const statusScore = {
          severely_stunted: 4,
          stunting: 3,
          berisiko_stunting: 2,
          normal: 1,
        };

        const latestScore = statusScore[latest.status_stunting] || 0;
        const earliestScore = statusScore[earliest.status_stunting] || 0;

        if (latestScore < earliestScore) {
          trend = "improving";
        } else if (latestScore > earliestScore) {
          trend = "worsening";
        } else {
          trend = "stable";
        }
      }

      return successResponse(
        res,
        {
          total_diagnosa: riwayat.length,
          status_counts: statusCounts,
          latest_status: riwayat[0].status_stunting,
          latest_date: riwayat[0].tanggal_diagnosa,
          trend: trend,
          trend_description:
            trend === "improving"
              ? "Kondisi anak membaik"
              : trend === "worsening"
                ? "Kondisi anak memburuk, perlu perhatian khusus"
                : "Kondisi anak stabil",
        },
        "Summary diagnosa berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiagnosaController();
