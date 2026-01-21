module.exports = (sequelize, DataTypes) => {
  const DetailMakananHarian = sequelize.define(
    "DetailMakananHarian",
    {
      id_detail: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_rekomendasi_harian: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      urutan_makanan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-7 untuk 7 kali makan",
      },
      waktu_makan: {
        type: DataTypes.ENUM(
          "susu_pagi",
          "makan_pagi",
          "snack_pagi",
          "makan_siang",
          "snack_sore",
          "makan_malam",
          "susu_malam",
        ),
        allowNull: false,
      },
      status_konsumsi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "true=sudah, false=belum",
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
      tableName: "detail_makanan_harian",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_rekomendasi_urutan",
          fields: ["id_rekomendasi_harian", "urutan_makanan"],
        },
      ],
    },
  );
};
