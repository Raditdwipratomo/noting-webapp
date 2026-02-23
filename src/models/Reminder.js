module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define(
    "Reminder",
    {
      id_reminder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      anak_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "anak",
          key: "anak_id",
        },
      },
      reminder_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Jenis reminder: makanan, obat, dokter, dll",
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID referensi ke tabel terkait (opsional)",
      },
      judul: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Judul reminder, misal: 'Makan Siang', 'Vaksin BCG'",
      },
      waktu_reminder: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Apakah reminder berulang",
      },
      recurring_pattern: {
        type: DataTypes.ENUM("harian", "mingguan", "bulanan", "tahunan"),
        allowNull: true,
        comment: "Pola pengulangan jika is_recurring = true",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_done: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Apakah reminder sudah diselesaikan",
      },
      pesan_custom: {
        type: DataTypes.TEXT,
        comment: "Pesan tambahan dari user",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Data tambahan spesifik per jenis reminder",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "reminders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["anak_id", "is_active"] },
        { fields: ["anak_id", "reminder_type"] },
        { fields: ["waktu_reminder"] },
      ],
    }
  );

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });
  };

  return Reminder;
};
