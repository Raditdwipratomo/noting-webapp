const AnakService = require("../services/anakService");
const { StatusCodes } = require("http-status-codes");
const PertumbuhanService = require("../services/pertumbuhanService");
const StuntingDetectionService = require("../services/stuntingDetectionService");
const { successResponse } = require("../utils/response");

class AnakController {
  async createAnak(req, res, next) {
    try {
      const {
        nama_anak,
        jenis_kelamin,
        tanggal_lahir,
        foto_profil,
        status_aktif,
        berat_badan_kg,
        tinggi_badan_cm,
        lingkar_lengan_atas_cm,
      } = req.body;

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
      };
      const anak = await AnakService.createAnak(req.user.user_id, anakData);

      const pertumbuhan = await PertumbuhanService.create(
        anak.anak_id,
        pertumbuhanData,
      );

      const diagnosaResult = await StuntingDetectionService.detectStunting(
        pertumbuhan,
        anak,
      );

      await StuntingDetectionService.saveDiagnosa(
        anak.anak_id,
        pertumbuhan.pertumbuhan_id,
        diagnosaResult,
      );

      return successResponse(
        res,
        {
          anak,
          pertumbuhan,
          dignosis: diagnosaResult,
        },
        "Data anak telah berhasil ditambahkan",
        StatusCodes.CREATED,
      );
    } catch (error) {
      next(error);
    }
  }

  async updateAnak(req, res, next) {
    try {
      const { anakId } = req.params;

      const result = await anakService.updateAnak(anakId, req.body);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnak(req, res, next) {
    try {
      const { anakId } = req.params;

      await anakService.deleteAnak(anakId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Berhasil menghapus data anak dengan id ${anakId}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnakByAnakId(req, res, next) {
    try {
      const { anak_id } = req.params;

      const result = await anakService.getAnakByAnakId(anak_id);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnakController();
