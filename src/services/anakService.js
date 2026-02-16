const { NotFoundError, ForbiddenError } = require("../middleware/errors");
const { Anak } = require("../models");

class AnakService {
  /**
   * Validate if user owns the child record
   * @param {number} anakId - The ID of the child
   * @param {number} userId - The ID of the user
   * @returns {Promise<Object>} Child record if validation passes
   * @throws {NotFoundError} If child not found
   * @throws {ForbiddenError} If user doesn't own the child
   */
  async validateOwnership(anakId, userId) {
    const anak = await Anak.findByPk(anakId);

    console.log("anakIdUser:", anak.user_id, "user id", userId);

    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    if (anak.user_id !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke data anak ini");
    }

    return anak;
  }

  /**
   * Create a new child record
   * @param {number} userId - The ID of the user
   * @param {Object} anakData - Child data to create
   * @returns {Promise<Object>} Created child record
   */
  async createAnak(userId, anakData) {
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
  }

  /**
   * Get all children for a user, ordered by creation date
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} List of children
   */
  async getAllAnakByUserId(userId) {
    const anakList = await Anak.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    return anakList;
  }

  /**
   * Get a child by their ID with ownership validation
   * @param {number} anakId - The ID of the child
   * @param {number} userId - The ID of the user (for ownership check)
   * @returns {Promise<Object>} Child record
   * @throws {NotFoundError} If child not found
   * @throws {ForbiddenError} If user doesn't own the child
   */
  async getAnakByAnakId(anakId, userId) {
    const anak = await this.validateOwnership(anakId, userId);
    return anak.toJSON();
  }

  /**
   * Get all children for a user
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} List of children
   */
  async getAnakByUserId(userId) {
    const listAnak = await Anak.findAll({
      where: { user_id: userId },
    });

    // Note: findAll returns empty array, not null
    if (listAnak.length === 0) {
      throw new NotFoundError("Anak tidak ada");
    }

    return listAnak;
  }

  /**
   * Update a child's information with ownership validation
   * @param {number} anakId - The ID of the child
   * @param {number} userId - The ID of the user (for ownership check)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated child record
   * @throws {NotFoundError} If child not found
   * @throws {ForbiddenError} If user doesn't own the child
   */
  async updateAnak(anakId, userId, updateData) {
    const anak = await this.validateOwnership(anakId, userId);
    await anak.update(updateData);
    return anak.toJSON();
  }

  /**
   * Delete a child record with ownership validation
   * @param {number} anakId - The ID of the child
   * @param {number} userId - The ID of the user (for ownership check)
   * @returns {Promise<Object>} Deleted child record
   * @throws {NotFoundError} If child not found
   * @throws {ForbiddenError} If user doesn't own the child
   */
  async deleteAnak(anakId, userId) {
    const anak = await this.validateOwnership(anakId, userId);
    await anak.destroy();
    return anak.toJSON();
  }
}

module.exports = new AnakService();
