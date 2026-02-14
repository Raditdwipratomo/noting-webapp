const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/errorHandler");
const { AlergiAnak, Anak } = require("../models");

class AlergiService {
  /**
   * Add allergy record for a child
   * @param {number} anakId - Child ID
   * @param {object} alergiData - Allergy data
   * @returns {Promise<object>} Created allergy record
   */
  async create(anakId, alergiData) {
    const {
      nama_alergen,
      tingkat_keparahan = "sedang",
      deskripsi,
      tanggal_ditemukan,
    } = alergiData;

    if (!nama_alergen) {
      throw new BadRequestError("Nama alergen wajib diisi");
    }

    // Verify anak exists
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    // Check if allergy already exists
    const existingAllergy = await AlergiAnak.findOne({
      where: {
        anak_id: anakId,
        nama_alergen: nama_alergen.toLowerCase(),
      },
    });

    if (existingAllergy) {
      throw new BadRequestError(
        `Alergi '${nama_alergen}' sudah tercatat untuk anak ini`,
      );
    }

    const alergi = await AlergiAnak.create({
      anak_id: anakId,
      nama_alergen: nama_alergen.toLowerCase(),
      tingkat_keparahan,
      deskripsi,
      tanggal_ditemukan: tanggal_ditemukan || new Date(),
    });

    return alergi;
  }

  /**
   * Get all allergies for a child
   * @param {number} anakId - Child ID
   * @returns {Promise<array>} List of allergies
   */
  async getByAnakId(anakId) {
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const allergies = await AlergiAnak.findAll({
      where: { anak_id: anakId },
      order: [
        ["tingkat_keparahan", "DESC"],
        ["nama_alergen", "ASC"],
      ],
    });

    return allergies;
  }

  /**
   * Get allergy by ID
   * @param {number} alergiId - Allergy ID
   * @returns {Promise<object>} Allergy record
   */
  async getById(alergiId) {
    const alergi = await AlergiAnak.findByPk(alergiId);

    if (!alergi) {
      throw new NotFoundError("Data alergi tidak ditemukan");
    }

    return alergi;
  }

  /**
   * Update allergy record
   * @param {number} alergiId - Allergy ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated record
   */
  async update(alergiId, updateData) {
    const alergi = await AlergiAnak.findByPk(alergiId);

    if (!alergi) {
      throw new NotFoundError("Data alergi tidak ditemukan");
    }

    // Don't allow changing anak_id
    delete updateData.anak_id;
    delete updateData.id;

    // Normalize nama_alergen if provided
    if (updateData.nama_alergen) {
      updateData.nama_alergen = updateData.nama_alergen.toLowerCase();
    }

    await alergi.update(updateData);

    return alergi;
  }

  /**
   * Delete allergy record
   * @param {number} alergiId - Allergy ID
   * @returns {Promise<object>} Deletion result
   */
  async delete(alergiId) {
    const alergi = await AlergiAnak.findByPk(alergiId);

    if (!alergi) {
      throw new NotFoundError("Data alergi tidak ditemukan");
    }

    await alergi.destroy();

    return { message: "Data alergi berhasil dihapus", id: alergiId };
  }

  /**
   * Get list of allergen names for a child (for filtering menus)
   * @param {number} anakId - Child ID
   * @returns {Promise<array>} List of allergen names
   */
  async getAllergenNames(anakId) {
    const allergies = await AlergiAnak.findAll({
      where: { anak_id: anakId },
      attributes: ["nama_alergen"],
    });

    return allergies.map((a) => a.nama_alergen);
  }

  /**
   * Check if child has specific allergy
   * @param {number} anakId - Child ID
   * @param {string} allergenName - Allergen name to check
   * @returns {Promise<boolean>} True if child has this allergy
   */
  async hasAllergy(anakId, allergenName) {
    const allergy = await AlergiAnak.findOne({
      where: {
        anak_id: anakId,
        nama_alergen: allergenName.toLowerCase(),
      },
    });

    return !!allergy;
  }

  /**
   * Get allergy summary for a child
   * @param {number} anakId - Child ID
   * @returns {Promise<object>} Allergy summary
   */
  async getSummary(anakId) {
    const allergies = await this.getByAnakId(anakId);

    const summary = {
      total: allergies.length,
      by_severity: {
        berat: allergies.filter((a) => a.tingkat_keparahan === "berat").length,
        sedang: allergies.filter((a) => a.tingkat_keparahan === "sedang")
          .length,
        ringan: allergies.filter((a) => a.tingkat_keparahan === "ringan")
          .length,
      },
      list: allergies.map((a) => a.nama_alergen),
      severe_allergies: allergies
        .filter((a) => a.tingkat_keparahan === "berat")
        .map((a) => a.nama_alergen),
    };

    return summary;
  }

  /**
   * Verify ownership of allergy record
   * @param {number} alergiId - Allergy ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user owns the record
   */
  async verifyOwnership(alergiId, userId) {
    const alergi = await AlergiAnak.findByPk(alergiId, {
      include: [
        {
          model: Anak,
          as: "anak",
          attributes: ["user_id"],
        },
      ],
    });

    if (!alergi) {
      throw new NotFoundError("Data alergi tidak ditemukan");
    }

    if (alergi.anak.user_id !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke data ini");
    }

    return true;
  }

}

module.exports = new AlergiService();
