const Groq = require("groq-sdk");
const aiConfig = require("../config/ai");
const {
  RencanaGiziMingguan,
  RekomendasiHarian,
  DetailMakananHarian,
  AlergiAnak,
} = require("../models");

const groq = new Groq({ apiKey: aiConfig.groq.apiKey });

class GiziRecommendationService {
  async generateRencanaMingguan(anakId, pertumbuhanData, diagnosisResult) {
    try {
      const alergi = await AlergiAnak.findAll({ where: { anak_id: anakId } });

      const daftarAlergan = alergi.map((a) => a.nama_alergen.toLowerCase());

      const prompt = GiziRecommendationService.buildPrompt(
        pertumbuhanData,
        diagnosisResult,
        daftarAlergan,
      );

      const aiResponse = await GiziRecommendationService.callGroqAI(prompt);

      const rencanaGizi = GiziRecommendationService.parseAIResponse(aiResponse);

      return rencanaGizi;
    } catch (error) {
      console.error("generateRencanaMingguan error:", error.message);
      throw error; // 🔥 WAJIB
    }
  }

  static buildPrompt(pertumbuhanData, diagnosisResult, daftarAlergen) {
    const usiaBulan = pertumbuhanData.usia_bulan;
    const usiaTahun = (usiaBulan / 12).toFixed();

    const alergiText =
      daftarAlergen.length > 0
        ? `Anak memiliki alergi terhadap: ${daftarAlergen.join(",")}. JANGAN rekomendasikan makanan yang mengandung alergen tersebut.`
        : "Anak tidak memiliki alergi makanan";

    const stuntingText = this.getStuntingDescription(
      diagnosisResult.status_stunting,
    );

    return `Buatkan rencana menu makanan mingguan (7 hari) untuk anak dengan data berikut:

DATA ANAK:
- Usia: ${usiaBulan} bulan (${usiaTahun} tahun)
- Berat badan: ${pertumbuhanData.berat_badan_kg} kg
- Tinggi badan: ${pertumbuhanData.tinggi_badan_cm} cm
- Status stunting: ${diagnosisResult.status_stunting} (${stuntingText})

ALERGI:
${alergiText}

INSTRUKSI:
1. Buat menu untuk 7 hari, masing-masing hari memiliki 7 waktu makan: susu_pagi, makan_pagi, snack_pagi, makan_siang, snack_sore, makan_malam, susu_malam
2. Hitung kebutuhan kalori harian berdasarkan data anak
3. Hitung kebutuhan nutrisi (protein, kalsium, zat besi, zinc, vitamin)
4. Setiap menu harus mencantumkan: nama makanan, porsi, estimasi kalori, dan protein
5. Gunakan makanan lokal Indonesia yang mudah didapat
6. Variasikan menu setiap hari
7. Jika anak stunting atau berisiko, prioritaskan makanan tinggi protein dan kalori
8. Berikan catatan khusus berdasarkan kondisi anak

Respons HARUS dalam format JSON berikut (tanpa markdown, tanpa backtick, hanya JSON murni):
{
  "kebutuhan_kalori_harian": {
    "total_kalori": <number>,
    "bmr": <number>,
    "faktor_aktivitas": <number>,
    "adjustment_stunting": <number>
  },
  "kebutuhan_nutrisi": {
    "protein_gram": <number>,
    "lemak_persen": <number>,
    "karbohidrat_persen": <number>,
    "kalsium_mg": <number>,
    "zat_besi_mg": <number>,
    "zinc_mg": <number>,
    "vitamin_a_mcg": <number>,
    "vitamin_d_mcg": <number>,
    "vitamin_c_mg": <number>
  },
  "menu_mingguan": [
    {
      "hari_ke": 1,
      "makanan": [
        {
          "urutan": 1,
          "waktu_makan": "susu_pagi",
          "target_kalori": <number>,
          "menu": {
            "nama": "<string>",
            "porsi": "<string>",
            "kalori": <number>,
            "protein": <number>
          }
        }
      ]
    }
  ],
  "catatan_khusus": ["<string>"]
}`;
  }

  static getStuntingDescription(status) {
    const description = {
      serverely_stunted:
        "Anak mengalami stunting berat, perlu asupan nutrisi ekstra untuk catch-up growth",
      stunting:
        "Anak mengalami stunting, perlu peningkatan asupan nutrisi untuk mengejar pertumbuhan",
      berisiko_stunting:
        "Anak berisiko mengalami stunting, perlu pencegahan dengan nutrisi optimal",
      normal:
        "Pertumbuhan anak normal, perlu nutrisi seimbang untuk menjaga pertumbuhan",
    };

    return description[status];
  }

  static async callGroqAI(prompt) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: aiConfig.systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: aiConfig.groq.model,
        temperature: aiConfig.groq.temperature,
        max_tokens: aiConfig.groq.maxTokens,
        top_p: aiConfig.groq.topP,
      });

      const responseContent = chatCompletion.choices[0]?.message?.content;

      if (!responseContent) {
        throw new Error("AI tidak memberikan respons yang valid");
      }

      return responseContent;
    } catch (error) {
      if (error.status === 429) {
        throw new Error(
          "AI service sedang sibuk (rate limit). Silahkan coba lagi dalam beberapa saat.",
        );
      }

      if (error.status === 401) {
        throw new Error(
          "Konfigurasi AI tidak valid. Silakan hubungi administrator.",
        );
      }

      throw new Error(`AI service error: ${error.message}`);
    }
  }

  static parseAIResponse(responseText) {
    try {
      // Clean up response — remove potential markdown fencing
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      const parsed = JSON.parse(cleanedResponse);

      // Validate required fields
      if (!parsed.kebutuhan_kalori_harian) {
        throw new Error("Missing kebutuhan_kalori_harian");
      }
      if (!parsed.kebutuhan_nutrisi) {
        throw new Error("Missing kebutuhan_nutrisi");
      }
      if (!parsed.menu_mingguan || !Array.isArray(parsed.menu_mingguan)) {
        throw new Error("Missing or invalid menu_mingguan");
      }
      if (parsed.menu_mingguan.length !== 7) {
        throw new Error("menu_mingguan harus memiliki 7 hari");
      }

      // Validate each day has the required meal entries
      for (const hari of parsed.menu_mingguan) {
        if (!hari.makanan || !Array.isArray(hari.makanan)) {
          throw new Error(`Hari ke-${hari.hari_ke} missing makanan array`);
        }
        if (hari.makanan.length !== 7) {
          throw new Error(
            `Hari ke-${hari.hari_ke} harus memiliki 7 waktu makan, got ${hari.makanan.length}`,
          );
        }
      }

      if (!parsed.catatan_khusus || !Array.isArray(parsed.catatan_khusus)) {
        parsed.catatan_khusus = [
          "Konsultasikan dengan dokter atau ahli gizi untuk panduan lebih lanjut",
        ];
      }

      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Gagal memproses respons AI (format tidak valid). Silakan coba lagi. Detail: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async saveRencanaGizi(anakId, rencanaData) {
    if (
      !rencanaData ||
      !Array.isArray(rencanaData.menu_mingguan) ||
      rencanaData.menu_mingguan.length !== 7
    ) {
      throw new Error("menu_mingguan harus berupa array 7 hari");
    }

    try {
      const today = new Date();
      const tanggalSelesai = new Date(today);
      tanggalSelesai.setDate(today.getDate() + 7);

      const existingPlan = await RencanaGiziMingguan.findOne({
        where: { anak_id: anakId, is_completed: false },
      });

      const mingguKe = existingPlan ? existingPlan.minggu_ke + 1 : 1;

      const rencana = await RencanaGiziMingguan.create({
        anak_id: anakId,
        minggu_ke: mingguKe,
        tanggal_mulai: today,
        tanggal_selesai: tanggalSelesai,
        progress: 0,
        is_completed: false,
      });

      for (let i = 0; i < 7; i++) {
        const tanggalHari = new Date(today);
        tanggalHari.setDate(today.getDate() + i);

        const menuHari = rencanaData.menu_mingguan[i];
        if (!menuHari || !Array.isArray(menuHari.makanan)) {
          throw new Error(`Menu hari ke-${i + 1} tidak valid`);
        }

        const rekomendasiHarian = await RekomendasiHarian.create({
          id_rencana: rencana.id_rencana,
          anak_id: anakId,
          tanggal: tanggalHari,
          hari_ke: i + 1,
          progress_harian: 0,
          jumlah_makanan_total: 7,
          status: i === 0 ? "sedang_berjalan" : "belum_dimulai",
        });

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
      console.error("saveRencanaGizi error:", error.message);
      throw error;
    }
  }
}

module.exports = new GiziRecommendationService();
