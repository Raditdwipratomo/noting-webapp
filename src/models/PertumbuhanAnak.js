module.exports = (sequelize, DataTypes) => {
  const PertumbuhanAnak = sequelize.define(
    "PertumbuhanAnak",
    {
      id_pertumbuhan: {
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
      tanggal_pencatatan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      berat_badan_kg: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: "dalam kilogram",
        validate: {
          min: 0.5,
          max: 200,
        },
      },
      tinggi_badan_cm: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: "dalam centimeter",
        validate: {
          min: 30,
          max: 250,
        },
      },
      lingkar_lengan_atas_cm: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: "dalam centimeter",
        validate: {
          min: 5,
          max: 50,
        },
      },
      lingkar_kepala_cm: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: "penting untuk anak <2 tahun",
        validate: {
          min: 20,
          max: 70,
        },
      },
      kategori: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "sangat buruk, buruk, normal, baik, sangat baik",
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "pertumbuhan_anak",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["anak_id", "tanggal_pencatatan"],
        },
        {
          fields: ["anak_id", "tanggal_pencatatan"],
        },
      ],
    }
  );

  // Associations
  PertumbuhanAnak.associate = (models) => {
    PertumbuhanAnak.belongsTo(models.Anak, {
      foreignKey: "anak_id",
      as: "anak",
      onDelete: "CASCADE",
    });

    PertumbuhanAnak.hasMany(models.RiwayatDiagnosa, {
      foreignKey: "pertumbuhan_id",
      as: "diagnosa",
      onDelete: "CASCADE",
    });
  };

  return PertumbuhanAnak;
};
