const AnakService = require("../services/anakService");
const PertumbuhanService = require("../services/pertumbuhanService");
const StuntingDetectionService = require("../services/stuntingDetectionService");
const { StatusCodes } = require("http-status-codes");
const { successResponse } = require("../utils/response");

class AnakController {
  /**
   * Create a new child with initial growth data and stunting detection
   */
  async createAnak(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        nama_anak,
        jenis_kelamin,
        tanggal_lahir,
        foto_profil,
        status_aktif,
        berat_badan_kg,
        tinggi_badan_cm,
        lingkar_lengan_atas_cm,
        lingkar_kepala_cm,
        catatan,
      } = req.body;

      // Prepare data objects
      const anakData = {
        nama_anak,
        jenis_kelamin,
        tanggal_lahir,
        foto_profil,
        status_aktif,
      };

      const pertumbuhanData = {
        berat_badan_kg,
        tinggi_badan_cm,
        lingkar_lengan_atas_cm,
        lingkar_kepala_cm,
        catatan,
      };

      // Create child record
      const anak = await AnakService.createAnak(userId, anakData);

      // Create initial growth record
      const pertumbuhan = await PertumbuhanService.create(
        anak.anak_id,
        pertumbuhanData,
      );

      // Detect stunting
      const diagnosaResult = await StuntingDetectionService.detectStunting(
        pertumbuhan,
        anak,
      );

      console.log("diagnosis: ", diagnosaResult);

      // Save diagnosis
      await StuntingDetectionService.saveDiagnosa(
        anak.anak_id,
        pertumbuhan.id_pertumbuhan,
        diagnosaResult,
      );

      return successResponse(
        res,
        {
          anak,
          pertumbuhan,
          diagnosis: diagnosaResult, // Fixed typo: dignosis -> diagnosis
        },
        "Data anak telah berhasil ditambahkan",
        StatusCodes.CREATED,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all children for the authenticated user
   */
  async getAllAnak(req, res, next) {
    try {
      const userId = req.user.user_id;
      const anakList = await AnakService.getAllAnakByUserId(userId);

      return successResponse(
        res,
        anakList,
        "Berhasil mengambil daftar anak",
        StatusCodes.OK,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific child by ID with ownership validation
   */
  async getAnakByAnakId(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const anak = await AnakService.getAnakByAnakId(anakId, userId);

      return successResponse(
        res,
        anak,
        "Berhasil mengambil data anak",
        StatusCodes.OK,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a child's information with ownership validation
   */
  async updateAnak(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      const updatedAnak = await AnakService.updateAnak(
        anakId,
        userId,
        req.body,
      );

      // If tanggal_lahir was updated, recalculate stunting diagnosis
      // because age affects Z-score calculations
      if (req.body.tanggal_lahir) {
        const latestPertumbuhan = await PertumbuhanService.getLatest(anakId);
        if (latestPertumbuhan) {
          const diagnosaResult =
            await StuntingDetectionService.detectStunting(
              latestPertumbuhan,
              updatedAnak,
            );
          await StuntingDetectionService.saveDiagnosa(
            anakId,
            latestPertumbuhan.id_pertumbuhan,
            diagnosaResult,
          );
        }
      }

      return successResponse(
        res,
        updatedAnak,
        "Data anak berhasil diperbarui",
        StatusCodes.OK,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a child with ownership validation
   */
  async deleteAnak(req, res, next) {
    try {
      const { anakId } = req.params;
      const userId = req.user.user_id;

      await AnakService.deleteAnak(anakId, userId);

      return successResponse(
        res,
        null,
        `Berhasil menghapus data anak dengan id ${anakId}`,
        StatusCodes.OK,
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnakController();
