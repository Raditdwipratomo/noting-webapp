module.exports = (sequelize, DataTypes) => {
  const ResepMakanan = sequelize.define(
    "ResepMakanan",
    {
      id_resep: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_detail_makanan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "detail_makanan_harian",
          key: "id_detail",
        },
      },
      waktu_persiapan: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Waktu persiapan dalam menit",
      },
      waktu_memasak: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Waktu memasak dalam menit",
      },
      bahan_bahan: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("bahan_bahan");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("bahan_bahan", JSON.stringify(value || []));
        },
        comment: "Array of bahan-bahan (disimpan sebagai JSON string)",
      },
      langkah_pembuatan: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("langkah_pembuatan");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("langkah_pembuatan", JSON.stringify(value || []));
        },
        comment: "Array of langkah pembuatan (disimpan sebagai JSON string)",
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
      tableName: "resep_makanan",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_resep_detail_makanan",
          fields: ["id_detail_makanan"],
        },
      ],
    },
  );

  ResepMakanan.associate = (models) => {
    ResepMakanan.belongsTo(models.DetailMakananHarian, {
      foreignKey: "id_detail_makanan",
      as: "detail_makanan_harian",
      onDelete: "CASCADE",
    });
  };

  return ResepMakanan;
};
