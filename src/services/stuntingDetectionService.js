const ZScoreCalculator = require("./zScoreCalculator");
const { RiwayatDiagnosa } = require("../models");
const { Anak } = require("../models");

class StuntingDetectionService {
  /**
   * Deteksi status stunting berdasarkan data pertumbuhan
   */
  static async detectStunting(pertumbuhanData, anakData) {
    try {
      const anak = await Anak.findByPk(anakData.anak_id);

      const usiaBulan = anak.getUmurBulan();

      // Hitung Z-Scores
      const zScores = await ZScoreCalculator.calculateAllZScores({
        tinggiCm: pertumbuhanData.tinggi_badan_cm,
        beratKg: pertumbuhanData.berat_badan_kg,
        lilaCm: pertumbuhanData.lingkar_lengan_atas_cm,
        jenisKelamin: anak.jenis_kelamin,
        usiaBulan: usiaBulan,
      });

      // Tentukan status stunting berdasarkan Z-Score tinggi badan
      const statusStunting = this.determineStuntingStatus(
        zScores.tinggi_badan.zScore,
        zScores.berat_badan.zScore,
        zScores.lila?.zScore,
      );

      // Generate rekomendasi
      const rekomendasi = this.generateRecommendations(
        statusStunting,
        zScores,
        usiaBulan,
      );

      return {
        status_stunting: statusStunting.status,
        z_score_tinggi_badan: zScores.tinggi_badan.zScore,
        z_score_berat_badan: zScores.berat_badan.zScore,
        z_score_lila: zScores.lila?.zScore || null,
        kategori_tinggi: zScores.tinggi_badan.kategori,
        kategori_berat: zScores.berat_badan.kategori,
        kategori_lila: zScores.lila?.kategori || null,
        tingkat_keparahan: statusStunting.severity,
        rekomendasi_tindakan: rekomendasi.tindakan,
        rekomendasi_gizi: rekomendasi.gizi,
        catatan: rekomendasi.catatan,
        detail_zscore: zScores,
      };
    } catch (error) {
      throw new Error(`Error detecting stunting: ${error.message}`);
    }
  }

  /**
   * Tentukan status stunting
   */
  static determineStuntingStatus(zScoreTB, zScoreBB, zScoreLILA) {
    let status, severity;

    // Klasifikasi berdasarkan TB/U (Height-for-Age)
    if (zScoreTB < -3) {
      status = "severely_stunted";
      severity = "berat";
    } else if (zScoreTB < -2) {
      status = "stunting";
      severity = "sedang";
    } else if (zScoreTB >= -2 && zScoreTB < -1) {
      status = "berisiko_stunting";
      severity = "ringan";
    } else {
      status = "normal";
      severity = "normal";
    }

    // Pertimbangkan BB/U dan LILA untuk assessment lebih komprehensif
    const kondisiTambahan = [];

    if (zScoreBB < -2) {
      kondisiTambahan.push("underweight");
      if (severity === "normal") severity = "ringan";
    }

    if (zScoreLILA && zScoreLILA < -2) {
      kondisiTambahan.push("wasting");
      if (severity === "normal" || severity === "ringan") severity = "sedang";
    }

    return {
      status,
      severity,
      kondisi_tambahan: kondisiTambahan,
    };
  }

  /**
   * Generate rekomendasi berdasarkan status
   */
  static generateRecommendations(statusStunting, zScores, usiaBulan) {
    const rekomendasi = {
      tindakan: [],
      gizi: [],
      catatan: [],
    };

    // Rekomendasi berdasarkan status stunting
    switch (statusStunting.status) {
      case "severely_stunted":
        rekomendasi.tindakan.push(
          "SEGERA konsultasi dengan dokter anak atau ahli gizi",
          "Pemeriksaan kesehatan menyeluruh",
          "Evaluasi pola makan dan asupan gizi",
          "Monitoring ketat pertumbuhan setiap minggu",
        );
        rekomendasi.gizi.push(
          "Tingkatkan asupan protein hewani (telur, ikan, daging)",
          "Pastikan asupan kalori mencukupi kebutuhan",
          "Berikan makanan bergizi seimbang 5-6 kali sehari",
          "Pertimbangkan suplementasi vitamin dan mineral",
        );
        break;

      case "stunting":
        rekomendasi.tindakan.push(
          "Konsultasi dengan tenaga kesehatan",
          "Monitoring pertumbuhan setiap 2 minggu",
          "Evaluasi pola pemberian makan",
        );
        rekomendasi.gizi.push(
          "Tingkatkan kualitas dan kuantitas makanan",
          "Fokus pada protein, vitamin A, zat besi, dan zinc",
          "Berikan makanan padat gizi",
          "Atur jadwal makan teratur",
        );
        break;

      case "berisiko_stunting":
        rekomendasi.tindakan.push(
          "Monitoring pertumbuhan rutin setiap bulan",
          "Perhatikan pola makan dan aktivitas anak",
          "Konsultasi jika ada kekhawatiran",
        );
        rekomendasi.gizi.push(
          "Pastikan asupan gizi seimbang",
          "Variasi menu makanan",
          "Cukupi kebutuhan protein dan mikronutrien",
        );
        break;

      default:
        rekomendasi.tindakan.push(
          "Pertahankan pola pertumbuhan yang baik",
          "Monitoring rutin setiap 3 bulan",
        );
        rekomendasi.gizi.push(
          "Lanjutkan pola makan bergizi seimbang",
          "Variasi menu makanan sehat",
        );
    }

    // Rekomendasi tambahan berdasarkan berat badan
    if (zScores.berat_badan.zScore < -2) {
      rekomendasi.catatan.push(
        "Anak mengalami underweight, perlu peningkatan asupan kalori dan protein",
      );
    }

    // Rekomendasi berdasarkan LILA
    if (zScores.lila && zScores.lila.zScore < -2) {
      rekomendasi.catatan.push(
        "Lingkar lengan atas rendah, indikasi malnutrisi akut. Segera konsultasi tenaga kesehatan",
      );
    }

    // Rekomendasi berdasarkan usia
    if (usiaBulan < 6) {
      rekomendasi.catatan.push("ASI eksklusif sangat penting untuk usia ini");
    } else if (usiaBulan >= 6 && usiaBulan < 24) {
      rekomendasi.catatan.push(
        "Periode emas pemberian MPASI, pastikan makanan bergizi dan bervariasi",
        "Lanjutkan pemberian ASI hingga 2 tahun",
      );
    }

    return rekomendasi;
  }

  /**
   * Simpan diagnosa ke database
   */
  static async saveDiagnosa(anakId, pertumbuhanId, diagnosisResult) {
    try {
      // Validate input parameters
      if (!anakId || !pertumbuhanId) {
        throw new BadRequestError(
          "ID anak dan pertumbuhan harus diisi",
          "MISSING_REQUIRED_IDS",
        );
      }

      console.log("diagnosis result", diagnosisResult);

      if (!diagnosisResult || typeof diagnosisResult !== "object") {
        throw new BadRequestError(
          "Data diagnosis tidak valid",
          "INVALID_DIAGNOSIS_DATA",
        );
      }

      // Validate required fields in diagnosisResult
      if (!diagnosisResult.status_stunting) {
        throw new BadRequestError(
          "Status stunting harus diisi",
          "MISSING_STATUS_STUNTING",
        );
      }

      // Prepare data for saving
      const diagnosaData = {
        anak_id: anakId,
        pertumbuhan_id: pertumbuhanId,
        tanggal_diagnosa: new Date(),
        status_stunting: diagnosisResult.status_stunting,
        z_score_tinggi_badan: diagnosisResult.z_score_tinggi_badan || null,
        z_score_berat_badan: diagnosisResult.z_score_berat_badan || null,
        z_score_berat_tinggi: diagnosisResult.z_score_lila || null,
        rekomendasi_tindakan: diagnosisResult.rekomendasi_tindakan
          ? JSON.stringify({
              tindakan: diagnosisResult.rekomendasi_tindakan,
              gizi: diagnosisResult.rekomendasi_gizi || null,
            })
          : null,
        catatan: Array.isArray(diagnosisResult.catatan)
          ? diagnosisResult.catatan.join("\n")
          : diagnosisResult.catatan || null,
      };

      // Check if diagnosis already exists for this anak_id and pertumbuhan_id
      const existingDiagnosa = await RiwayatDiagnosa.findOne({
        where: {
          anak_id: anakId,
          pertumbuhan_id: pertumbuhanId,
        },
      });

      let savedDiagnosa;

      if (existingDiagnosa) {
        // Update existing diagnosis
        await existingDiagnosa.update({
          status_stunting: diagnosaData.status_stunting,
          z_score_tinggi_badan: diagnosaData.z_score_tinggi_badan,
          z_score_berat_badan: diagnosaData.z_score_berat_badan,
          z_score_berat_tinggi: diagnosaData.z_score_berat_tinggi,
          rekomendasi_tindakan: diagnosaData.rekomendasi_tindakan,
          catatan: diagnosaData.catatan,
          tanggal_diagnosa: new Date(), // Update timestamp
        });

        savedDiagnosa = existingDiagnosa;
      } else {
        // Create new diagnosis
        savedDiagnosa = await RiwayatDiagnosa.create(diagnosaData);
      }

      return savedDiagnosa.toJSON();
    } catch (error) {
      console.error("Error saving diagnosa:", {
        error: error.message,
        anakId,
        pertumbuhanId,
        stack: error.stack,
      });

      // Handle Sequelize Unique Constraint Error
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(
          "Diagnosis untuk data pertumbuhan ini sudah ada",
          "DUPLICATE_DIAGNOSIS",
        );
      }

      // Handle Sequelize Validation Error
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((e) => ({
          field: e.path,
          message: e.message,
          value: e.value,
        }));
        throw new ValidationError(
          "Validasi data diagnosis gagal",
          validationErrors,
          "DIAGNOSIS_VALIDATION_ERROR",
        );
      }

      // Handle Foreign Key Constraint Error
      if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new BadRequestError(
          "ID anak atau pertumbuhan tidak valid",
          "INVALID_FOREIGN_KEY",
        );
      }

      // Handle Database Error
      if (error.name === "SequelizeDatabaseError") {
        throw new DatabaseError(
          "Terjadi kesalahan database saat menyimpan diagnosis",
          "DATABASE_ERROR",
        );
      }

      // If it's already a custom AppError, re-throw it
      if (error.statusCode) {
        throw error;
      }

      // Wrap unexpected errors
      throw new DatabaseError(
        `Gagal menyimpan diagnosis: ${error.message}`,
        "SAVE_DIAGNOSIS_ERROR",
      );
    }
  }

  /**
   * Get riwayat diagnosa anak
   */
  static async getRiwayatDiagnosa(anakId, limit = 10) {
    try {
      const riwayat = await RiwayatDiagnosa.findAll({
        where: { anak_id: anakId },
        order: [["tanggal_diagnosa", "DESC"]],
        limit: limit,
        include: [
          {
            association: "pertumbuhan",
            attributes: [
              "berat_badan_kg",
              "tinggi_badan_cm",
              "lingkar_lengan_atas_cm",
            ],
          },
        ],
      });

      return riwayat;
    } catch (error) {
      throw new Error(`Error getting diagnosa history: ${error.message}`);
    }
  }
}

module.exports = StuntingDetectionService;
