module.exports = (sequelize, DataTypes) => {
  const StandarWHO = sequelize.define(
    "StandarWHO",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jenis_kelamin: {
        type: DataTypes.ENUM("L", "P"),
        allowNull: false,
      },
      usia_bulan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "usia dalam bulan (0-60)",
      },
      // Standar Tinggi Badan (TB/U)
      tb_minus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -3SD (sangat pendek)",
      },
      tb_minus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -2SD (pendek/stunting)",
      },
      tb_minus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -1SD",
      },
      tb_median: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score 0 (median)",
      },
      tb_plus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +1SD",
      },
      tb_plus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +2SD (tinggi)",
      },
      tb_plus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +3SD (sangat tinggi)",
      },
      // Standar Berat Badan (BB/U)
      bb_minus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -3SD (gizi buruk)",
      },
      bb_minus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -2SD (gizi kurang)",
      },
      bb_minus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -1SD",
      },
      bb_median: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score 0 (median)",
      },
      bb_plus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +1SD",
      },
      bb_plus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +2SD (gizi lebih)",
      },
      bb_plus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +3SD (obesitas)",
      },
      // Standar Lingkar Kepala (LK/U)
      lk_minus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -3SD (mikrosefali berat)",
      },
      lk_minus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -2SD (mikrosefali)",
      },
      lk_minus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -1SD",
      },
      lk_median: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score 0 (median)",
      },
      lk_plus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +1SD",
      },
      lk_plus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +2SD (makrosefali)",
      },
      lk_plus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +3SD (makrosefali berat)",
      },
      // Standar Lingkar Lengan Atas (LILA/U)
      lila_minus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -3SD (malnutrisi akut berat)",
      },
      lila_minus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -2SD (malnutrisi akut)",
      },
      lila_minus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score -1SD",
      },
      lila_median: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score 0 (median)",
      },
      lila_plus_1sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +1SD",
      },
      lila_plus_2sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +2SD",
      },
      lila_plus_3sd: {
        type: DataTypes.DECIMAL(5, 2),
        comment: "Z-score +3SD",
      },
    },
    {
      tableName: "standar_who",
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: "idx_jk_usia",
          fields: ["jenis_kelamin", "usia_bulan"],
        },
      ],
    },
  );

  // Class methods
  StandarWHO.getStandard = async function (jenisKelamin, usiaBulan) {
    return await this.findOne({
      where: {
        jenis_kelamin: jenisKelamin,
        usia_bulan: usiaBulan,
      },
    });
  };

  return StandarWHO;
};
