const { NotFoundError } = require("../middleware/errorHandler");
const { Anak } = require("../models");

class AnakService {
  async createAnak(userId, anakData) {
    try {
      const {
        nama_anak,
        jenis_kelamin,
        tanggal_lahir,
        foto_profil,
        status_aktif,
      } = anakData;

      const createdAnak = await Anak.create({
        user_id: userId,
        nama_anak,
        jenis_kelamin,
        tanggal_lahir,
        foto_profil,
        status_aktif,
      });

      return createdAnak.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async getAnakByAnakId(anakId) {
    try {
      const anak = await Anak.findByPk(anakId);

      if (!anak) {
        throw new NotFoundError("Anak tidak ditemukan", 404);
      }

      return anak;
    } catch (error) {
      throw error;
    }
  }

  async getAnakByUserId(userId) {
    try {
      const listAnak = await Anak.findAll({
        where: {
          user_id: userId,
        },
      });

      if (!listAnak) {
        throw new NotFoundError("Anak tidak ada", 404);
      }

      return listAnak;
    } catch (error) {
      throw error;
    }
  }

  async updateAnak(anakId, updateData) {
    try {
      const selectedAnak = await Anak.findByPk(anakId);

      if (!selectedAnak) {
        throw new NotFoundError("Anak tidak ada", 404);
      }

      await selectedAnak.update(updateData);

      return selectedAnak.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async deleteAnak(anakId) {
    try {
      const anak = await Anak.findByPk(anakId);

      if (!anak) {
        throw new NotFoundError("Anak tidak ditemukan", 404);
      }

      await anak.destroy();

      return anak;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AnakService();
