const Groq = require("groq-sdk");
const aiConfig = require("../config/ai");
const AnakService = require("../services/anakService");
const PertumbuhanService = require("../services/pertumbuhanService");
const StuntingDetectionService = require("../services/stuntingDetectionService");
const { successResponse } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");
const {
  DetailMakananHarian,
  RencanaGiziMingguan,
  RekomendasiHarian,
} = require("../models");
const GiziRecommendationService = require("../services/giziRecommendationService");

class GiziController {
  /**
   * Generate new weekly nutrition plan
   * POST /anak/:anakId/gizi/rencana/generate
   */
  async generateRencana(req, res, next) {
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
            "Tidak ada data pertumbuhan. Silakan input data pertumbuhan terlebih dahulu",
        });
      }

      const diagnosaHistory = await StuntingDetectionService.getRiwayatDiagnosa(
        anakId,
        1,
      );

      let diagnosisResult;

      if (diagnosaHistory.length > 0) {
        diagnosisResult = {
          status_stunting: diagnosaHistory[0].status_stunting,
        };
      } else {
        diagnosisResult = await StuntingDetectionService.detectStunting(
          latestPertumbuhan,
          anak,
        );
      }

      const pertumbuhanWithAge = {
        ...latestPertumbuhan.toJSON(),
        usia_bulan: anak.getUmurBulan(),
      };

      const rencanaGizi =
        await GiziRecommendationService.generateRencanaMingguan(
          anakId,
          pertumbuhanWithAge,
          diagnosisResult,
        );

      const savedRencana = await GiziRecommendationService.savedRencana(
        anakId,
        rencanaGizi,
      );

      return successResponse(
        res,
        {
          rencana_id: savedRencana.id_rencana,
          minggu_ke: savedRencana.minggu_ke,
          tanggal_mulai: savedRencana.tanggal_mulai,
          tanggal_selesai: savedRencana.tanggal_selesai,
          kebutuhan_kalori: rencanaGizi.kebutuhan_kalori_harian,
          kebutuhan_nutrisi: rencanaGizi.kebutuhan_nutrisi,
          catatan_khusus: rencanaGizi.catatan_khusus,
          menu_mingguan: rencanaGizi.menu_mingguan,
        },
        "Rencana gizi mingguan berhasil dibuat oleh AI",
        StatusCodes.CREATED,
      );
    } catch (error) {} // Handle AI-specific errors with appropriate status codes
    if (error.message.includes("rate limit")) {
      return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("Konfigurasi AI")) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Layanan AI tidak tersedia. Silakan hubungi administrator.",
      });
    }
    if (error.message.includes("Gagal memproses respons AI")) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "AI menghasilkan respons yang tidak valid. Silakan coba lagi.",
      });
    }
    next(error);
  }

  /**
   * Get current/active weekly nutrition plan
   * GET /anak/:anakId/gizi/rencana
   */
  async getCurrentRencana(req, res, next) {
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

      const rencana = await RencanaGiziMingguan.findOne({
        where: { anak_id: anakId, is_completed: false },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: RekomendasiHarian,
            as: "rekomendasi_harian",
            include: [
              {
                model: DetailMakananHarian,
                as: "detail_makanan",
              },
            ],
          },
        ],
      });

      if (!rencana) {
        return successResponse(
          res,
          null,
          "Belum ada rencana gizi aktif. Silakan generate rencana baru.",
        );
      }

      return successResponse(res, rencana, "Rencana gizi berhasil diambil");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all weekly plans history
   * GET /anak/:anakId/gizi/rencana/history
   */
  async getRencanaHistory(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;
      const { limit = 10, offset = 0 } = req.query;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const { count, rows } = await RencanaGiziMingguan.findAndCountAll({
        where: { anak_id: anakId },
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return successResponse(
        res,
        {
          data: rows,
          pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        },
        "Riwayat rencana gizi berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily recommendation
   * GET /anak/:anakId/gizi/hari/:hariKe
   */
  async getDailyRecommendation(req, res, next) {
    try {
      const { anakId, hariKe } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const rekomendasi = await RekomendasiHarian.findOne({
        where: { anak_id: anakId, hari_ke: parseInt(hariKe) },
        include: [{ model: DetailMakananHarian, as: "detail_makanan" }],
      });

      if (!rekomendasi) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: `Rekomendasi untuk hari ke-${hariKe} tidak ditemukan`,
        });
      }

      return successResponse(
        res,
        rekomendasi,
        "Rekomendasi harian berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get today's recommendation
   * GET /anak/:anakId/gizi/today
   */
  async getTodayRecommendation(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rekomendasi = await RekomendasiHarian.findOne({
        where: { anak_id: anakId, tanggal: today },
        include: [{ model: DetailMakananHarian, as: "detail_makanan" }],
      });

      if (!rekomendasi) {
        return successResponse(
          res,
          null,
          "Belum ada rekomendasi untuk hari ini. Silakan generate rencana mingguan baru.",
        );
      }

      return successResponse(
        res,
        rekomendasi,
        "Rekomendasi hari ini berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update food consumption status
   * PATCH /anak/:anakId/gizi/makanan/:detailId
   */
  async updateMakananStatus(req, res, next) {
    try {
      const { anakId, detailId } = req.params;
      const userId = req.user.user_id;
      const { status_konsumsi } = req.body;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const detail = await DetailMakananHarian.findByPk(detailId, {
        include: [
          {
            model: RekomendasiHarian,
            as: "rekomendasi_harian",
          },
        ],
      });

      if (!detail) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Detail makanan tidak ditemukan",
        });
      }

      await detail.update({ status_konsumsi: status_konsumsi === true });

      const allDetailsForDay = await DetailMakananHarian.findAll({
        where: { id_rekomendasi_harian: detail.id_rekomendasi_harian },
      });

      const completedCount = allDetailsForDay.filter(
        (d) => d.status_konsumsi,
      ).length;
      const totalCount = allDetailsForDay.length;

      await RekomendasiHarian.update(
        {
          progress_harian: completedCount,
          status: completedCount === totalCount ? "selesai" : "sedang_berjalan",
        },
        {
          where: { id_rekomendasi_harian: detail.id_rekomendasi_harian },
        },
      );

      return successResponse(
        res,
        {
          detail_id: detailId,
          status_konsumsi: detail.status_konsumsi,
          daily_progress: `${completedCount}/${totalCount}`,
        },
        "Status konsumsi berhasil diupdate",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get weekly progress
   * GET /anak/:anakId/gizi/progress
   */

  async getProgress(req, res, next) {
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

      const rencana = await RencanaGiziMingguan.findOne({
        where: { anak_id: anakId, is_completed: false },
        order: [["created_at", "DESC"]],
      });

      if (!rencana) {
        return successResponse(res, null, "Tidak ada rencana gizi aktif");
      }

      const rekomendasiHarian = await RekomendasiHarian.findAll({
        where: { id_rencana: rencana.id_rencana },
        include: [
          {
            model: DetailMakananHarian,
            as: "detail_makanan",
          },
        ],
        order: [["hari_ke", "ASC"]],
      });

      let totalMakanan = 0;
      let totalKonsumsi = 0;

      const dailyProgress = rekomendasiHarian.map((rh) => {
        const completed = rh.detail_makanan.filter(
          (d) => d.status_konsumsi,
        ).length;
        const total = rh.detail_makanan_length;
        totalMakanan += total;
        totalKonsumsi += completed;

        return {
          hari_ke: rh.hari_ke,
          tanggal: rh.tanggal,
          progress: `${completed}/${total}`,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          status: rh.status,
        };
      });

      const overallPercentage =
        totalMakanan > 0 ? Math.round((totalKonsumsi / totalMakanan) * 100) : 0;

      return successResponse(
        res,
        {
          rencana_id: rencana.id_rencana,
          minggu_ke: rencana.minggu_ke,
          tanggal_mulai: rencana.tanggal_mulai,
          tanggal_selesai: rencana.tanggal_selesai,
          overall_progress: `${totalKonsumsi}/${totalMakanan}`,
          overall_percentage: overallPercentage,
          daily_progress: dailyProgress,
        },
        "Progress mingguan berhasil diambil",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark weekly plan as completed
   * POST /anak/:anakId/gizi/rencana/:rencanaId/complete
   */
  async completeRencana(req, res, next) {
    try {
      const { anakId, rencanaId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId);
      if (anak.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Anda tidak memiliki akses ke data anak ini",
        });
      }

      const rencana = await RencanaGiziMingguan.findByPk(rencanaId);

      if (!rencana || rencana.anak_id !== parseInt(anakId)) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Rencana gizi tidak ditemukan",
        });
      }

      await rencana.update({ is_completed: true });

      return successResponse(
        res,
        rencana,
        "Rencana gizi berhasil ditandai selesai",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GiziController();
