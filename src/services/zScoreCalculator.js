const { StandarWHO } = require('../models');

/**
 * Menghitung Z-Score berdasarkan standar WHO
 * Formula: Z-Score = (nilai_aktual - median) / SD
 */
class ZScoreCalculator {
  /**
   * Hitung Z-Score untuk tinggi badan (TB/U)
   */
  static async calculateHeightForAge(tinggiCm, jenisKelamin, usiaBulan) {
    try {
      const standar = await StandarWHO.getStandard(jenisKelamin, usiaBulan);
      
      if (!standar) {
        throw new Error(`Standar WHO tidak ditemukan untuk usia ${usiaBulan} bulan`);
      }

      // Tentukan SD yang sesuai berdasarkan posisi nilai
      let sd;
      if (tinggiCm < standar.tb_median) {
        // Gunakan SD negatif
        sd = standar.tb_median - standar.tb_minus_1sd;
      } else {
        // Gunakan SD positif
        sd = standar.tb_plus_1sd - standar.tb_median;
      }

      const zScore = (tinggiCm - standar.tb_median) / sd;
      
      return {
        zScore: parseFloat(zScore.toFixed(2)),
        standar: {
          median: standar.tb_median,
          minus_2sd: standar.tb_minus_2sd,
          minus_3sd: standar.tb_minus_3sd,
          plus_2sd: standar.tb_plus_2sd,
          plus_3sd: standar.tb_plus_3sd
        },
        kategori: this.kategorikanTinggi(zScore)
      };
    } catch (error) {
      throw new Error(`Error calculating height z-score: ${error.message}`);
    }
  }

  /**
   * Hitung Z-Score untuk berat badan (BB/U)
   */
  static async calculateWeightForAge(beratKg, jenisKelamin, usiaBulan) {
    try {
      const standar = await StandarWHO.getStandard(jenisKelamin, usiaBulan);
      
      if (!standar) {
        throw new Error(`Standar WHO tidak ditemukan untuk usia ${usiaBulan} bulan`);
      }

      let sd;
      if (beratKg < standar.bb_median) {
        sd = standar.bb_median - standar.bb_minus_1sd;
      } else {
        sd = standar.bb_plus_1sd - standar.bb_median;
      }

      const zScore = (beratKg - standar.bb_median) / sd;
      
      return {
        zScore: parseFloat(zScore.toFixed(2)),
        standar: {
          median: standar.bb_median,
          minus_2sd: standar.bb_minus_2sd,
          minus_3sd: standar.bb_minus_3sd,
          plus_2sd: standar.bb_plus_2sd,
          plus_3sd: standar.bb_plus_3sd
        },
        kategori: this.kategorikanBerat(zScore)
      };
    } catch (error) {
      throw new Error(`Error calculating weight z-score: ${error.message}`);
    }
  }

  /**
   * Hitung Z-Score untuk lingkar lengan atas (LILA/U)
   */
  static async calculateMUACForAge(lilaCm, jenisKelamin, usiaBulan) {
    try {
      const standar = await StandarWHO.getStandard(jenisKelamin, usiaBulan);
      
      if (!standar || !standar.lila_median) {
        return null; // LILA tidak tersedia untuk semua usia
      }

      let sd;
      if (lilaCm < standar.lila_median) {
        sd = standar.lila_median - standar.lila_minus_1sd;
      } else {
        sd = standar.lila_plus_1sd - standar.lila_median;
      }

      const zScore = (lilaCm - standar.lila_median) / sd;
      
      return {
        zScore: parseFloat(zScore.toFixed(2)),
        standar: {
          median: standar.lila_median,
          minus_2sd: standar.lila_minus_2sd,
          minus_3sd: standar.lila_minus_3sd
        },
        kategori: this.kategorikanLILA(zScore, lilaCm)
      };
    } catch (error) {
      throw new Error(`Error calculating MUAC z-score: ${error.message}`);
    }
  }

  /**
   * Kategorikan status tinggi badan
   */
  static kategorikanTinggi(zScore) {
    if (zScore < -3) return 'severely_stunted';
    if (zScore < -2) return 'stunted';
    if (zScore >= -2 && zScore <= 2) return 'normal';
    if (zScore > 2 && zScore <= 3) return 'tall';
    return 'very_tall';
  }

  /**
   * Kategorikan status berat badan
   */
  static kategorikanBerat(zScore) {
    if (zScore < -3) return 'severely_underweight';
    if (zScore < -2) return 'underweight';
    if (zScore >= -2 && zScore <= 2) return 'normal';
    if (zScore > 2 && zScore <= 3) return 'overweight';
    return 'obese';
  }

  /**
   * Kategorikan status LILA
   */
  static kategorikanLILA(zScore, lilaCm) {
    // WHO: LILA < 11.5 cm = SAM (Severe Acute Malnutrition)
    // LILA < 12.5 cm = MAM (Moderate Acute Malnutrition)
    if (lilaCm < 11.5) return 'severe_acute_malnutrition';
    if (lilaCm < 12.5) return 'moderate_acute_malnutrition';
    if (zScore < -2) return 'wasted';
    if (zScore >= -2 && zScore <= 2) return 'normal';
    return 'above_normal';
  }

  /**
   * Hitung semua Z-Score sekaligus
   */
  static async calculateAllZScores(data) {
    const { tinggiCm, beratKg, lilaCm, jenisKelamin, usiaBulan } = data;

    const results = {
      usia_bulan: usiaBulan,
      jenis_kelamin: jenisKelamin
    };

    // Hitung Z-Score tinggi badan
    results.tinggi_badan = await this.calculateHeightForAge(
      tinggiCm,
      jenisKelamin,
      usiaBulan
    );

    // Hitung Z-Score berat badan
    results.berat_badan = await this.calculateWeightForAge(
      beratKg,
      jenisKelamin,
      usiaBulan
    );

    // Hitung Z-Score LILA jika tersedia
    if (lilaCm) {
      results.lila = await this.calculateMUACForAge(
        lilaCm,
        jenisKelamin,
        usiaBulan
      );
    }

    return results;
  }
}

module.exports = ZScoreCalculator;