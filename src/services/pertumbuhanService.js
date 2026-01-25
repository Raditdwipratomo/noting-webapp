const { NotFoundError } = require("../middleware/errorHandler");
const { PertumbuhanAnak } = require("../models");

class PertumbuhanAnakService {
  async create(anak_id, pertumbuhanData) {
    const { berat_badan_kg, tinggi_badan_cm, lingkar_lengan_atas_cm } =
      pertumbuhanData;

    if (!anak_id) {
      throw new NotFoundError("Tidak ada anak_id", 404);
    }

    const pertumbuhan = await PertumbuhanAnak.create({
      anak_id,
      tanggal_pencatatan: new Date(),
      berat_badan_kg,
      tinggi_badan_cm,
      lingkar_lengan_atas_cm,
    });

    return pertumbuhan;
  }
}

module.exports = new PertumbuhanAnakService();
