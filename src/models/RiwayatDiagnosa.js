module.exports = (sequelize, DataTypes) => {
  const RiwayatDiagnosa = sequelize.define(
    "RiwayatDiagnosa",
    {
      id_diagnosa: {
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
      pertumbuhan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "pertumbuhan_anak",
          key: "id_pertumbuhan",
        },
      },
      tanggal_diagnosa: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status_stunting: {
        type: DataTypes.STRING(50),
        comment: "normal/berisiko/stunting/severely_stunted",
      },
      z_score_tinggi_badan: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score TB/U",
      },
      z_score_berat_badan: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score BB/U",
      },
      z_score_berat_tinggi: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score BB/TB",
      },
      rekomendasi_tindakan: {
        type: DataTypes.TEXT,
      },
      catatan: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
    },
    {
      tableName: "riwayat_diagnosa",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          fields: ["anak_id", "tanggal_diagnosa"],
        },
      ],
    }
  );

  // Associations
  RiwayatDiagnosa.associate = (models) => {
    RiwayatDiagnosa.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });

    RiwayatDiagnosa.belongsTo(models.PertumbuhanAnak, {
      foreignKey: "pertumbuhan_id",
      as: "pertumbuhan",
      onDelete: "CASCADE",
    });
  };

  return RiwayatDiagnosa;
};
