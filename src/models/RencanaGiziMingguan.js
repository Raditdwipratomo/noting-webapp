module.exports = (sequelize, DataTypes) => {
  const RencanaGiziMingguan = sequelize.define(
    "RencanaGiziMingguan",
    {
      id_rencana: {
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
      minggu_ke: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal_mulai: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      tanggal_selesai: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "rencana_gizi_mingguan",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_anak_minggu",
          fields: ["anak_id", "minggu_ke"],
          comment: "Index untuk query berdasarkan anak dan minggu",
        },
        {
          name: "idx_status",
          fields: ["is_completed"],
          comment: "Index untuk filter status completed",
        },
        {
          name: "idx_tanggal",
          fields: ["tanggal_mulai", "tanggal_selesai"],
          comment: "Index untuk query berdasarkan range tanggal",
        },
      ],
    },
  );

  RencanaGiziMingguan.associate = (models) => {
    RencanaGiziMingguan.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });

    RencanaGiziMingguan.hasMany(models.RekomendasiHarian, {
      foreignKey: "id_rencana_gizi",
      as: "rekomendasi_harian",
      onDelete: "CASCADE",
    });
  };

  return RencanaGiziMingguan;
};
