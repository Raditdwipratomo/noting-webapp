const ReminderService = require("../services/reminderService");
const {
  BadRequestError,
} = require("../middleware/errors");

class ReminderController {
  // CREATE reminder
  async create(req, res, next) {
    try {
      const { anakId } = req.params;
      const reminder = await ReminderService.create(
        parseInt(anakId),
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Reminder berhasil dibuat",
        data: reminder,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET all reminders by anak
  async getByAnakId(req, res, next) {
    try {
      const { anakId } = req.params;
      const { activeOnly } = req.query;

      const reminders = await ReminderService.getByAnakId(
        parseInt(anakId),
        { activeOnly: activeOnly === "true" }
      );

      res.status(200).json({
        success: true,
        count: reminders.length,
        data: reminders,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET reminder by ID
  async getById(req, res, next) {
    try {
      const { reminderId } = req.params;

      const reminder = await ReminderService.getById(
        parseInt(reminderId)
      );

      res.status(200).json({
        success: true,
        data: reminder,
      });
    } catch (err) {
      next(err);
    }
  }

  // UPDATE reminder
  async update(req, res, next) {
    try {
      const { reminderId } = req.params;

      const updated = await ReminderService.update(
        parseInt(reminderId),
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Reminder berhasil diperbarui",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // TOGGLE active status
  async toggleActive(req, res, next) {
    try {
      const { reminderId } = req.params;

      const updated = await ReminderService.toggleActive(
        parseInt(reminderId)
      );

      res.status(200).json({
        success: true,
        message: "Status reminder berhasil diubah",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE reminder
  async delete(req, res, next) {
    try {
      const { reminderId } = req.params;

      const result = await ReminderService.delete(
        parseInt(reminderId)
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GENERATE default reminders
  async generateDefault(req, res, next) {
    try {
      const { anakId } = req.params;

      const reminders = await ReminderService.generateDefaultReminders(
        parseInt(anakId)
      );

      res.status(201).json({
        success: true,
        message: "Default reminder berhasil dibuat",
        count: reminders.length,
        data: reminders,
      });
    } catch (err) {
      next(err);
    }
  }

  // VERIFY ownership (optional endpoint)
  async verifyOwnership(req, res, next) {
    try {
      const { reminderId } = req.params;
      const userId = req.user.user_id; // dari middleware auth

      await ReminderService.verifyOwnership(
        parseInt(reminderId),
        userId
      );

      res.status(200).json({
        success: true,
        message: "User memiliki akses ke reminder ini",
      });
    } catch (err) {
      next(err);
    }
  }

  // GET reminders to trigger (for scheduler / cron)
  async getRemindersToTrigger(req, res, next) {
    try {
      const reminders = await ReminderService.getRemindersToTrigger();

      res.status(200).json({
        success: true,
        count: reminders.length,
        data: reminders,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReminderController();