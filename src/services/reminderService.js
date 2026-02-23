const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/errors");
const { Reminder, Anak, DetailMakananHarian } = require("../models");

class ReminderService {
  /**
   * Create a new reminder
   * @param {number} anakId - Child ID
   * @param {object} reminderData - Reminder data
   * @returns {Promise<object>} Created reminder
   */
  async create(anakId, reminderData) {
    const {
      reminder_type,
      reference_id,
      judul,
      waktu_reminder,
      is_recurring,
      recurring_pattern,
      pesan_custom,
      metadata
    } = reminderData;

    if (!waktu_reminder || !reminder_type || !judul) {
      throw new BadRequestError("Waktu reminder, tipe, dan judul wajib diisi");
    }

    // Verify anak exists
    const anak = await Anak.findByPk(anakId);
    if (!anak) {
      throw new NotFoundError("Anak tidak ditemukan");
    }

    const reminder = await Reminder.create({
      anak_id: anakId,
      reminder_type,
      reference_id: reference_id || null,
      judul,
      waktu_reminder,
      is_recurring: is_recurring || false,
      recurring_pattern: recurring_pattern || null,
      is_active: true,
      is_done: false,
      pesan_custom,
      metadata
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

    const reminders = await Reminder.findAll({
      where: whereClause,
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
    const reminder = await Reminder.findByPk(reminderId);

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
    const reminder = await Reminder.findByPk(reminderId);

    if (!reminder) {
      throw new NotFoundError("Reminder tidak ditemukan");
    }

    // Don't allow changing anak_id or ID
    delete updateData.anak_id;
    delete updateData.id_reminder;

    await reminder.update(updateData);

    return reminder;
  }

  /**
   * Toggle reminder active status
   * @param {number} reminderId - Reminder ID
   * @returns {Promise<object>} Updated reminder
   */
  async toggleActive(reminderId) {
    const reminder = await Reminder.findByPk(reminderId);

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
    const reminder = await Reminder.findByPk(reminderId);

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

    // Create current date but adjust times
    const createTime = (hours) => {
      const d = new Date();
      d.setHours(hours, 0, 0, 0);
      return d;
    };

    const defaultTimes = [
      { waktu: createTime(6), pesan: "Waktunya susu pagi!", type: "makan", judul: "Susu Pagi" },
      { waktu: createTime(8), pesan: "Waktunya makan pagi!", type: "makan", judul: "Makan Pagi" },
      { waktu: createTime(10), pesan: "Waktunya snack pagi!", type: "makan", judul: "Snack Pagi" },
      { waktu: createTime(12), pesan: "Waktunya makan siang!", type: "makan", judul: "Makan Siang" },
      { waktu: createTime(15), pesan: "Waktunya snack sore!", type: "makan", judul: "Snack Sore" },
      { waktu: createTime(18), pesan: "Waktunya makan malam!", type: "makan", judul: "Makan Malam" },
      { waktu: createTime(20), pesan: "Waktunya susu malam!", type: "makan", judul: "Susu Malam" },
    ];

    const createdReminders = [];

    for (const time of defaultTimes) {
      const reminder = await Reminder.create({
        anak_id: anakId,
        reminder_type: time.type,
        judul: time.judul,
        waktu_reminder: time.waktu,
        is_active: true,
        is_done: false,
        is_recurring: true,
        recurring_pattern: "harian",
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
    const reminder = await Reminder.findByPk(reminderId, {
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
    // For general reminders we probably want checking past due etc instead of exact strict time matching, 
    // but preserving original logic structure for now
    const now = new Date();
    
    // We would need a more complex query to handle DATE types reliably but for simplicity:
    const reminders = await Reminder.findAll({
      where: {
        is_active: true,
        is_done: false
      },
      include: [
        {
          model: Anak,
          as: "anak",
        },
      ],
      // We would filter by waktu_reminder <= now
    });

    return reminders;
  }
}



module.exports = new ReminderService();
