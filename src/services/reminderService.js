const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/errors");
const { ReminderMakanan, Anak, DetailMakananHarian } = require("../models");

class ReminderService {
  /**
   * Create a new reminder
   * @param {number} anakId - Child ID
   * @param {object} reminderData - Reminder data
   * @returns {Promise<object>} Created reminder
   */
  async create(anakId, reminderData) {
    const {
      waktu_reminder,
      tipe_notifikasi = "push",
      pesan_custom,
      id_detail_makanan,
    } = reminderData;

    if (!waktu_reminder) {
      throw new BadRequestError("Waktu reminder wajib diisi");
    }

    // Verify anak exists
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    // If linked to specific meal detail, verify it exists
    if (id_detail_makanan) {
      const detail = await DetailMakananHarian.findByPk(id_detail_makanan);
      if (!detail) {
        throw new NotFoundError("Detail makanan tidak ditemukan");
      }
    }

    const reminder = await ReminderMakanan.create({
      anak_id: anakId,
      id_detail_makanan: id_detail_makanan || null,
      waktu_reminder,
      is_active: true,
      tipe_notifikasi,
      pesan_custom,
    });

    return reminder;
  }

  /**
   * Get all reminders for a child
   * @param {number} anakId - Child ID
   * @param {object} options - Query options
   * @returns {Promise<array>} List of reminders
   */
  async getByAnakId(anakId, options = {}) {
    const { activeOnly = false } = options;

    const whereClause = { anak_id: anakId };
    if (activeOnly) {
      whereClause.is_active = true;
    }

    const reminders = await ReminderMakanan.findAll({
      where: whereClause,
      include: [
        {
          model: DetailMakananHarian,
          as: "detail_makanan",
          required: false,
        },
      ],
      order: [["waktu_reminder", "ASC"]],
    });

    return reminders;
  }

  /**
   * Get reminder by ID
   * @param {number} reminderId - Reminder ID
   * @returns {Promise<object>} Reminder
   */
  async getById(reminderId) {
    const reminder = await ReminderMakanan.findByPk(reminderId, {
      include: [
        {
          model: DetailMakananHarian,
          as: "detail_makanan",
          required: false,
        },
      ],
    });

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    return reminder;
  }

  /**
   * Update a reminder
   * @param {number} reminderId - Reminder ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated reminder
   */
  async update(reminderId, updateData) {
    const reminder = await ReminderMakanan.findByPk(reminderId);

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    // Don't allow changing anak_id
    delete updateData.anak_id;
    delete updateData.id;

    await reminder.update(updateData);

    return reminder;
  }

  /**
   * Toggle reminder active status
   * @param {number} reminderId - Reminder ID
   * @returns {Promise<object>} Updated reminder
   */
  async toggleActive(reminderId) {
    const reminder = await ReminderMakanan.findByPk(reminderId);

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    await reminder.update({ is_active: !reminder.is_active });

    return reminder;
  }

  /**
   * Delete a reminder
   * @param {number} reminderId - Reminder ID
   * @returns {Promise<object>} Deletion result
   */
  async delete(reminderId) {
    const reminder = await ReminderMakanan.findByPk(reminderId);

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    await reminder.destroy();

    return { message: "Reminder berhasil dihapus", id: reminderId };
  }

  /**
   * Generate default reminders based on standard meal times
   * @param {number} anakId - Child ID
   * @returns {Promise<array>} Created reminders
   */
  async generateDefaultReminders(anakId) {
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const defaultTimes = [
      { waktu: "06:00:00", pesan: "Waktunya susu pagi!" },
      { waktu: "08:00:00", pesan: "Waktunya makan pagi!" },
      { waktu: "10:00:00", pesan: "Waktunya snack pagi!" },
      { waktu: "12:00:00", pesan: "Waktunya makan siang!" },
      { waktu: "15:00:00", pesan: "Waktunya snack sore!" },
      { waktu: "18:00:00", pesan: "Waktunya makan malam!" },
      { waktu: "20:00:00", pesan: "Waktunya susu malam!" },
    ];

    const createdReminders = [];

    for (const time of defaultTimes) {
      const reminder = await ReminderMakanan.create({
        anak_id: anakId,
        waktu_reminder: time.waktu,
        is_active: true,
        tipe_notifikasi: "push",
        pesan_custom: time.pesan,
      });
      createdReminders.push(reminder);
    }

    return createdReminders;
  }

  /**
   * Verify ownership of reminder
   * @param {number} reminderId - Reminder ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user owns the reminder
   */
  async verifyOwnership(reminderId, userId) {
    const reminder = await ReminderMakanan.findByPk(reminderId, {
      include: [
        {
          model: Anak,
          as: "anak",
          attributes: ["user_id"],
        },
      ],
    });

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    if (reminder.anak.user_id !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke reminder ini");
    }

    return true;
  }

  /**
   * Get reminders that should fire now (for notification service)
   * @returns {Promise<array>} List of reminders to trigger
   */
  async getRemindersToTrigger() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5) + ":00"; // Format: HH:MM:00

    const reminders = await ReminderMakanan.findAll({
      where: {
        waktu_reminder: currentTime,
        is_active: true,
      },
      include: [
        {
          model: Anak,
          as: "anak",
        },
      ],
    });

    return reminders;
  }
}

module.exports = new ReminderService();
