module.exports = (sequelize, DataTypes) => {
  const ReminderMakanan = sequelize.define(
    "ReminderMakanan",
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
      id_detail_makanan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "detail_makanan_harian",
          key: "id_detail",
        },
      },
      waktu_reminder: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      pesan_custom: {
        type: DataTypes.TEXT,
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
      tableName: "reminder_makanan",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["anak_id", "is_active"],
        },
      ],
    },
  );

  ReminderMakanan.associate = (models) => {
    ReminderMakanan.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });
  };

  ReminderMakanan.associate = (models) => {
  ReminderMakanan.hasMany(models.DetailMakananHarian, {
    foreignKey: "id_reminder",
    as: "detail_makanan"
  });
};

  return ReminderMakanan;
};
