const { Op } = require("sequelize");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/errors");
const { PertumbuhanAnak, Anak } = require("../models");

class PertumbuhanAnakService {
  async create(anakId, pertumbuhanData) {
    const {
      berat_badan_kg,
      tinggi_badan_cm,
      lingkar_lengan_atas_cm,
      lingkar_kepala_cm,
      catatan,
    } = pertumbuhanData;

    if (!anakId) {
      throw new BadRequestError("Anak ID wajib diisi");
    }

    const anak = await Anak.findByPk(anakId);

    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await PertumbuhanAnak.findOne({
      where: {
        anak_id: anakId,
        tanggal_pencatatan: today,
      },
    });

    if (existingRecord) {
      throw new BadRequestError(
        "Data pertumbuhan untuk hari ini sudah ada. Silakan update data yang ada",
      );
    }

    const pertumbuhan = await PertumbuhanAnak.create({
      anak_id: anakId,
      tanggal_pencatatan: new Date(),
      berat_badan_kg,
      tinggi_badan_cm,
      lingkar_lengan_atas_cm,
      lingkar_kepala_cm,
      catatan,
    });

    return pertumbuhan;
  }

  async getByAnakId(anakId, options = {}) {
    const { limit = 10, offset = 0, orderBy = "DESC" } = options;

    const anak = await Anak.findByPk(anakId);

    const { count, rows } = await PertumbuhanAnak.findAndCountAll({
      where: { anak_id: anakId },
      order: [["tanggal_pencatatan", orderBy]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      data: rows,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getById(pertumbuhanId) {
    const pertumbuhan = await PertumbuhanAnak.findByPk(pertumbuhanId, {
      include: [
        {
          model: Anak,
          as: "anak",
          attributes: [
            "anak_id",
            "nama_anak",
            "jenis_kelamin",
            "tanggal_lahir",
          ],
        },
      ],
    });

    if (!pertumbuhan) {
      throw new NotFoundError("Data pertumbuhan tidak ditemukan");
    }

    return pertumbuhan;
  }

  async getLatest(anakId) {
    const anak = await Anak.findByPk(anakId);

    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const pertumbuhan = await PertumbuhanAnak.findOne({
      where: { anak_id: anakId },
      order: [["tanggal_pencatatan", "DESC"]],
    });

    return pertumbuhan;
  }

  async getChartData(anakId, options = {}) {
    const { months = 12 } = options;

    const anak = await Anak.findByPk(anakId);

    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const pertumbuhanRecords = await PertumbuhanAnak.findAll({
      where: {
        anak_id: anakId,
        tanggal_pencatatan: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["tanggal_pencatatan", "ASC"]],
      attributes: [
        "tanggal_pencatatan",
        "berat_badan_kg",
        "tinggi_badan_cm",
        "lingkar_lengan_atas_cm",
        "lingkar_kepala_cm",
        "kategori",
      ],
    });

    return {
      labels: pertumbuhanRecords.map((r) => r.tanggal_pencatatan),
      datasets: {
        berat_badan: pertumbuhanRecords.map((r) =>
          parseFloat(r.berat_badan_kg),
        ),
        tinggi_badan: pertumbuhanRecords.map((r) =>
          parseFloat(r.tinggi_badan_cm),
        ),
        lingkar_kepala: pertumbuhanRecords.map((r) =>
          parseFloat(r.lingkar_kepala_cm),
        ),
        lingkar_lengan_atas: pertumbuhanRecords.map((r) =>
          parseFloat(r.lingkar_lengan_atas_cm),
        ),
      },
      metadata: {
        nama_anak: anak.nama_anak,
        jenis_kelamin: anak.jenis_kelamin,
        tanggal_lahir: anak.tanggal_lahir,
        total_records: pertumbuhanRecords.length,
      },
    };
  }

  async update(pertumbuhanId, updateData) {
    const pertumbuhan = await PertumbuhanAnak.findByPk(pertumbuhanId);

    if (!pertumbuhan) {
      throw new NotFoundError("Data pertumbuhan tidak ditemukan");
    }

    delete updateData.anak_id;
    delete updateData.id_pertumbuhan;

    await pertumbuhan.update(updateData);

    return pertumbuhan;
  }

  async delete(pertumbuhanId) {
    const pertumbuhan = await PertumbuhanAnak.findByPk(pertumbuhanId);

    if (!pertumbuhan) {
      throw new NotFoundError("Data pertumbuhan tidak ditemukan");
    }

    await pertumbuhan.destroy();

    return { message: "Data pertumbuhan berhasil dihapus", id: pertumbuhanId };
  }

  async verifyOwnership(pertumbuhanId, userId) {
    const pertumbuhan = await PertumbuhanAnak.findByPk(pertumbuhanId, {
      include: [
        {
          model: Anak,
          as: "anak",
          attributes: ["user_id"],
        },
      ],
    });

    if (!pertumbuhan) {
      throw new NotFoundError("Data pertumbuhan tidak ditemukan");
    }

    if (pertumbuhan.anak.user_id !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke data ini");
    }

    return true;
  }

  async getStatistics(anakId) {
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const records = await PertumbuhanAnak.findAll({
      where: { anak_id: anakId },
      order: [["tanggal_pencatatan", "ASC"]],
    });

    if (records.length === 0) {
      return {
        total_records: 0,
        first_record: null,
        last_record: null,
        growth_rate: null,
      };
    }

    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];

    // Calculate growth reate if we have at least 2 records

    let growthRate = null;
    if (records.length >= 2) {
      const timeDiffDays =
        Math.abs(
          new Date(lastRecord.tanggal_pencatatan) -
            new Date(firstRecord.tanggal_pencatatan),
        ) /
        (1000 * 60 * 60 * 24);

      const timeDiffMonths = timeDiffDays / 30;

      if (timeDiffMonths > 0) {
        growthRate = {
          berat_per_bulan: (
            (lastRecord.berat_badan_kg - firstRecord.berat_badan_kg) /
            timeDiffMonths
          ).toFixed(2),
          tinggi_per_bulan: (
            (lastRecord.tinggi_badan_cm - firstRecord.tinggi_badan_cm) /
            timeDiffMonths
          ).toFixed(2),
        };
      }

      return {
        total_records: records.length,
        first_record: {
          tanggal: firstRecord.tanggal_pencatatan,
          berat: firstRecord.berat_badan_kg,
          tinggi: firstRecord.tinggi_badan_cm,
        },
        lastRecord: {
          tanggal: lastRecord.tanggal_pencatatan,
          berat: lastRecord.berat_badan_kg,
          tinggi: lastRecord.tinggi_badan_cm,
        },
        total_growth: {
          berat: (
            lastRecord.berat_badan_kg - firstRecord.berat_badan_kg
          ).toFixed(2),
          tinggi: (
            lastRecord.tinggi_badan_cm - firstRecord.tinggi_badan_cm
          ).toFixed(2),
        },
        growth_rate: growthRate,
      };
    }
  }
}

module.exports = new PertumbuhanAnakService();
