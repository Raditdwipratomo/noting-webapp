const {
  RencanaGiziMingguan,
  RekomendasiHarian,
  DetailMakananHarian,
  NutrisiMakanan,
  AlergiAnak,
} = require("../models");
const { Op } = require("sequelize");

class GiziRecommendationService {
  /**
   * Generate rekomendasi gizi mingguan
   */
  static async generateRencanaMingguan(
    anakId,
    pertumbuhanData,
    diagnosisResult,
  ) {
    try {
      // Hitung kebutuhan kalori harian
      const kebutuhanKalori = this.hitungKebutuhanKalori(
        pertumbuhanData.berat_badan_kg,
        pertumbuhanData.tinggi_badan_cm,
        pertumbuhanData.usia_bulan,
        diagnosisResult.status_stunting,
      );

      // Hitung kebutuhan nutrisi
      const kebutuhanNutrisi = this.hitungKebutuhanNutrisi(
        pertumbuhanData.usia_bulan,
        pertumbuhanData.berat_badan_kg,
        diagnosisResult.status_stunting,
      );

      // Get alergi anak
      const alergi = await AlergiAnak.findAll({
        where: { anak_id: anakId },
      });
      const daftarAlergen = alergi.map((a) => a.nama_alergen.toLowerCase());

      // Generate menu mingguan
      const menuMingguan = await this.generateMenuMingguan(
        kebutuhanKalori,
        kebutuhanNutrisi,
        pertumbuhanData.usia_bulan,
        diagnosisResult.status_stunting,
        daftarAlergen,
      );

      return {
        kebutuhan_kalori_harian: kebutuhanKalori,
        kebutuhan_nutrisi: kebutuhanNutrisi,
        menu_mingguan: menuMingguan,
        catatan_khusus: this.generateCatatanKhusus(
          diagnosisResult.status_stunting,
          daftarAlergen,
        ),
      };
    } catch (error) {
      throw new Error(`Error generating nutrition plan: ${error.message}`);
    }
  }

  /**
   * Hitung kebutuhan kalori harian
   * Menggunakan rumus Schofield untuk anak
   */
  static hitungKebutuhanKalori(beratKg, tinggiCm, usiaBulan, statusStunting) {
    let bmr; // Basal Metabolic Rate
    const usiaTahun = usiaBulan / 12;

    // Rumus BMR untuk anak (Schofield equation)
    if (usiaTahun < 3) {
      bmr = 59.512 * beratKg - 30.4;
    } else if (usiaTahun < 10) {
      bmr = 22.706 * beratKg + 504.3 * (tinggiCm / 100) + 0;
    } else {
      bmr = 13.384 * beratKg + 4.035 * tinggiCm - 152.0;
    }

    // Faktor aktivitas (PAL - Physical Activity Level)
    let pal = 1.4; // Ringan-sedang untuk anak

    // Adjustment untuk stunting
    let adjustment = 1.0;
    if (
      statusStunting === "severely_stunted" ||
      statusStunting === "stunting"
    ) {
      adjustment = 1.2; // Perlu kalori lebih untuk catch-up growth
    } else if (statusStunting === "berisiko_stunting") {
      adjustment = 1.1;
    }

    const totalKalori = Math.round(bmr * pal * adjustment);

    return {
      total_kalori: totalKalori,
      bmr: Math.round(bmr),
      faktor_aktivitas: pal,
      adjustment_stunting: adjustment,
    };
  }

  /**
   * Hitung kebutuhan nutrisi harian
   */
  static hitungKebutuhanNutrisi(usiaBulan, beratKg, statusStunting) {
    const usiaTahun = usiaBulan / 12;

    // Base requirements (WHO/FAO recommendations)
    let protein = 1.5 * beratKg; // gram
    let lemak = 30; // % dari total kalori
    let karbohidrat = 55; // % dari total kalori
    let kalsium = 500; // mg
    let besi = 7; // mg
    let zinc = 5; // mg
    let vitaminA = 400; // mcg
    let vitaminD = 10; // mcg
    let vitaminC = 40; // mg

    // Adjustment berdasarkan usia
    if (usiaTahun < 1) {
      protein = 2.0 * beratKg;
      kalsium = 400;
      besi = 6;
    } else if (usiaTahun < 3) {
      protein = 1.8 * beratKg;
      kalsium = 600;
      besi = 7;
    } else if (usiaTahun < 6) {
      protein = 1.5 * beratKg;
      kalsium = 800;
      besi = 10;
      zinc = 7;
    }

    // Adjustment untuk stunting (perlu nutrisi lebih)
    if (
      statusStunting === "severely_stunted" ||
      statusStunting === "stunting"
    ) {
      protein *= 1.3;
      besi *= 1.2;
      zinc *= 1.3;
      kalsium *= 1.2;
    }

    return {
      protein_gram: Math.round(protein),
      lemak_persen: lemak,
      karbohidrat_persen: karbohidrat,
      kalsium_mg: Math.round(kalsium),
      zat_besi_mg: Math.round(besi),
      zinc_mg: Math.round(zinc),
      vitamin_a_mcg: Math.round(vitaminA),
      vitamin_d_mcg: Math.round(vitaminD),
      vitamin_c_mg: Math.round(vitaminC),
    };
  }

  /**
   * Generate menu mingguan (7 hari)
   */
  static async generateMenuMingguan(
    kebutuhanKalori,
    kebutuhanNutrisi,
    usiaBulan,
    statusStunting,
    alergen,
  ) {
    const menuMingguan = [];

    for (let hari = 1; hari <= 7; hari++) {
      const menuHarian = this.generateMenuHarian(
        hari,
        kebutuhanKalori.total_kalori,
        kebutuhanNutrisi,
        usiaBulan,
        statusStunting,
        alergen,
      );
      menuMingguan.push(menuHarian);
    }

    return menuMingguan;
  }

  /**
   * Generate menu harian (7 waktu makan)
   */
  static generateMenuHarian(
    hari,
    totalKalori,
    kebutuhanNutrisi,
    usiaBulan,
    statusStunting,
    alergen,
  ) {
    // Pembagian kalori per waktu makan
    const distribusiKalori = {
      susu_pagi: 0.15, // 15%
      makan_pagi: 0.2, // 20%
      snack_pagi: 0.1, // 10%
      makan_siang: 0.25, // 25%
      snack_sore: 0.1, // 10%
      makan_malam: 0.15, // 15%
      susu_malam: 0.05, // 5%
    };

    const waktuMakan = [
      "susu_pagi",
      "makan_pagi",
      "snack_pagi",
      "makan_siang",
      "snack_sore",
      "makan_malam",
      "susu_malam",
    ];

    const menuHarian = {
      hari_ke: hari,
      makanan: [],
    };

    waktuMakan.forEach((waktu, index) => {
      const targetKalori = Math.round(totalKalori * distribusiKalori[waktu]);
      const menu = this.getMenuByWaktu(
        waktu,
        targetKalori,
        usiaBulan,
        statusStunting,
        alergen,
        hari,
      );

      menuHarian.makanan.push({
        urutan: index + 1,
        waktu_makan: waktu,
        target_kalori: targetKalori,
        menu: menu,
      });
    });

    return menuHarian;
  }

  /**
   * Get menu recommendation by waktu makan
   */
  static getMenuByWaktu(
    waktu,
    targetKalori,
    usiaBulan,
    statusStunting,
    alergen,
    hari,
  ) {
    // Database menu (ini bisa dipindahkan ke database)
    const menuDatabase = {
      susu_pagi: [
        {
          nama: "ASI/Susu Formula",
          porsi: "200ml",
          kalori: 140,
          protein: 7,
          kalsium: 240,
        },
        {
          nama: "Susu UHT Full Cream",
          porsi: "200ml",
          kalori: 130,
          protein: 6.5,
          kalsium: 220,
        },
      ],
      makan_pagi: [
        {
          nama: "Bubur Ayam + Telur",
          porsi: "1 mangkuk",
          kalori: 250,
          protein: 15,
          besi: 2.5,
        },
        {
          nama: "Nasi Tim Ikan + Sayur",
          porsi: "1 mangkuk",
          kalori: 280,
          protein: 18,
          besi: 3,
        },
        {
          nama: "Roti Gandum + Selai Kacang + Pisang",
          porsi: "2 lembar",
          kalori: 300,
          protein: 12,
          besi: 2,
        },
        {
          nama: "Oatmeal + Susu + Buah",
          porsi: "1 mangkuk",
          kalori: 270,
          protein: 10,
          besi: 2.8,
        },
      ],
      snack_pagi: [
        {
          nama: "Pisang + Keju",
          porsi: "1 buah + 1 slice",
          kalori: 150,
          protein: 5,
          kalsium: 150,
        },
        {
          nama: "Yogurt + Granola",
          porsi: "1 cup",
          kalori: 160,
          protein: 7,
          kalsium: 200,
        },
        {
          nama: "Puding Susu",
          porsi: "1 cup",
          kalori: 140,
          protein: 4,
          kalsium: 180,
        },
      ],
      makan_siang: [
        {
          nama: "Nasi + Ayam Goreng + Sayur + Tempe",
          porsi: "1 piring",
          kalori: 450,
          protein: 25,
          besi: 4,
        },
        {
          nama: "Nasi + Ikan Bakar + Tahu + Sayur",
          porsi: "1 piring",
          kalori: 420,
          protein: 28,
          besi: 3.5,
        },
        {
          nama: "Nasi + Daging Sapi + Bayam",
          porsi: "1 piring",
          kalori: 480,
          protein: 30,
          besi: 5,
        },
      ],
      snack_sore: [
        {
          nama: "Ubi Rebus + Susu",
          porsi: "1 buah kecil",
          kalori: 150,
          protein: 3,
          kalsium: 80,
        },
        {
          nama: "Biskuit Susu",
          porsi: "5 keping",
          kalori: 140,
          protein: 3,
          kalsium: 100,
        },
        {
          nama: "Buah Potong Segar",
          porsi: "1 mangkuk",
          kalori: 120,
          protein: 2,
          vitaminC: 60,
        },
      ],
      makan_malam: [
        {
          nama: "Nasi + Telur Dadar + Sayur",
          porsi: "1 piring",
          kalori: 350,
          protein: 18,
          besi: 3,
        },
        {
          nama: "Nasi + Ikan + Tahu + Sayur",
          porsi: "1 piring",
          kalori: 380,
          protein: 22,
          besi: 3.5,
        },
        {
          nama: "Mie + Telur + Sayuran",
          porsi: "1 mangkuk",
          kalori: 360,
          protein: 16,
          besi: 2.8,
        },
      ],
      susu_malam: [
        {
          nama: "ASI/Susu Formula",
          porsi: "150ml",
          kalori: 105,
          protein: 5,
          kalsium: 180,
        },
        {
          nama: "Susu Hangat",
          porsi: "150ml",
          kalori: 100,
          protein: 5,
          kalsium: 165,
        },
      ],
    };

    // Filter berdasarkan alergen
    let availableMenu = menuDatabase[waktu].filter((menu) => {
      const menuLower = menu.nama.toLowerCase();
      return !alergen.some((allergen) => menuLower.includes(allergen));
    });

    // Jika usia < 6 bulan, hanya ASI
    if (usiaBulan < 6) {
      return menuDatabase.susu_pagi[0];
    }

    // Select menu based on day (rotation)
    const index = (hari - 1) % availableMenu.length;
    return availableMenu[index] || availableMenu[0];
  }

  /**
   * Generate catatan khusus
   */
  static generateCatatanKhusus(statusStunting, alergen) {
    const catatan = [];

    if (
      statusStunting === "severely_stunted" ||
      statusStunting === "stunting"
    ) {
      catatan.push("Fokus pada makanan tinggi protein dan kalori");
      catatan.push("Berikan makan lebih sering (5-6x sehari)");
      catatan.push("Pastikan asupan vitamin dan mineral terpenuhi");
    }

    if (alergen.length > 0) {
      catatan.push(`Hindari makanan yang mengandung: ${alergen.join(", ")}`);
      catatan.push("Ganti dengan alternatif yang setara nilai gizinya");
    }

    catatan.push("Variasi menu untuk mencegah kebosanan");
    catatan.push("Perhatikan tekstur makanan sesuai usia anak");
    catatan.push("Berikan makanan dalam suasana menyenangkan");

    return catatan;
  }

  /**
   * Simpan rencana gizi ke database
   */
  static async saveRencanaGizi(anakId, rencanaData) {
    try {
      const today = new Date();
      const tanggalSelesai = new Date(today);
      tanggalSelesai.setDate(today.getDate() + 7);

      // Cek apakah sudah ada rencana aktif
      const existingPlan = await RencanaGiziMingguan.findOne({
        where: {
          anak_id: anakId,
          is_completed: false,
        },
      });

      let mingguKe = 1;
      if (existingPlan) {
        mingguKe = existingPlan.minggu_ke + 1;
      }

      // Create rencana mingguan
      const rencana = await RencanaGiziMingguan.create({
        anak_id: anakId,
        minggu_ke: mingguKe,
        tanggal_mulai: today,
        tanggal_selesai: tanggalSelesai,
        progress: 0,
        is_completed: false,
      });

      // Create rekomendasi harian
      for (let i = 0; i < 7; i++) {
        const tanggalHari = new Date(today);
        tanggalHari.setDate(today.getDate() + i);

        const rekomendasiHarian = await RekomendasiHarian.create({
          id_rencana: rencana.id_rencana,
          anak_id: anakId,
          hari_ke: (mingguKe - 1) * 7 + (i + 1),
          tanggal: tanggalHari,
          progress_harian: 0,
          jumlah_makanan_total: 7,
          status: i === 0 ? "sedang_berjalan" : "belum_dimulai",
        });

        // Create detail makanan harian
        const menuHari = rencanaData.menu_mingguan[i];
        for (const makanan of menuHari.makanan) {
          await DetailMakananHarian.create({
            id_rekomendasi_harian: rekomendasiHarian.id_rekomendasi_harian,
            urutan_makanan: makanan.urutan,
            waktu_makan: makanan.waktu_makan,
            status_konsumsi: false,
          });
        }
      }

      return rencana;
    } catch (error) {
      throw new Error(`Error saving nutrition plan: ${error.message}`);
    }
  }
}

module.exports = GiziRecommendationService;
