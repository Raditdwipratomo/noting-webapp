module.exports = (sequelize, DataTypes) => {
  const RekomendasiHarian = sequelize.define(
    "RekomendasiHarian",
    {
      id_rekomendasi_harian: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_rencana: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "rencana_gizi_mingguan",
          key: "id_rencana",
        },
      },
      anak_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "anak",
          key: "anak_id",
        },
      },
      hari_ke: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      progress_harian: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      jumlah_makanan_total: {
        type: DataTypes.INTEGER,
        defaultValue: 7,
      },
      status: {
        type: DataTypes.ENUM("belum_dimulai", "sedang_berjalan", "selesai"),
        defaultValue: "belum_dimulai",
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
      tableName: "rekomendasi_harian",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          name: "unique_hari",
          fields: ["anak_id", "hari_ke"],
        },
        {
          name: "idx_tanggal",
          fields: ["tanggal"],
        },
      ],
    },
  );

  RekomendasiHarian.associate = (models) => {
    RekomendasiHarian.belongsTo(models.RencanaGiziMingguan, {
      foreignKey: "id_rencana",
      as: "rencana_gizi_mingguan",
      onDelete: "CASCADE",
    });
    RekomendasiHarian.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });
    RekomendasiHarian.hasMany(models.DetailMakananHarian, {
      foreignKey: "id_rekomendasi_harian",
      as: "detail_makanan_harian",
      onDelete: "CASCADE",
    });
  };

  return RekomendasiHarian;
};
