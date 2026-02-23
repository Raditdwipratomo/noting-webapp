module.exports = (sequelize, DataTypes) => {
  const Anak = sequelize.define(
    "Anak",
    {
      anak_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      nama_anak: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      jenis_kelamin: {
        type: DataTypes.ENUM("L", "P"),
        allowNull: false,
        comment: "L=Laki-laki, P=Perempuan",
        validate: {
          isIn: [["L", "P"]],
        },
      },
      tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString(),
        },
      },
      foto_profil: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status_aktif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: "anak",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["tanggal_lahir"],
        },
      ],
    },
  );

  // Instance methods
  Anak.prototype.getUmurBulan = function () {
    const today = new Date();
    const birthDate = new Date(this.tanggal_lahir);

    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();

    return months <= 0 ? 0 : months;
  };

  Anak.prototype.getUmurTahun = function () {
    return Math.floor(this.getUmurBulan() / 12);
  };

  Anak.associate = (models) => {
    Anak.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    Anak.hasMany(models.PertumbuhanAnak, {
      foreignKey: "anak_id",
      as: "pertumbuhan",
      onDelete: "CASCADE",
    });

    Anak.hasMany(models.RiwayatDiagnosa, {
      foreignKey: "anak_id",
      as: "diagnosa",
      onDelete: "CASCADE",
    });

    Anak.hasMany(models.RencanaGiziMingguan, {
      foreignKey: "anak_id",
      as: "rencana_gizi",
      onDelete: "CASCADE",
    });

    Anak.hasMany(models.AlergiAnak, {
      foreignKey: "anak_id",
      as: "alergi",
      onDelete: "CASCADE",
    });

    Anak.hasMany(models.Reminder, {
      foreignKey: "anak_id",
      as: "reminder",
      onDelete: "CASCADE",
    });
  };

  return Anak;
};
