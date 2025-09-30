
import { GoogleGenAI } from "@google/genai";
import { CaseData, CaseGuide } from '../types';
import { GUIDE_SCHEMA } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCaseGuide = async (caseData: CaseData): Promise<CaseGuide> => {
  const { caseType, casePosition, description } = caseData;

  const prompt = `
    Anda adalah asisten hukum AI yang ahli dalam hukum acara pidana di Indonesia.
    Tugas Anda adalah membuat panduan langkah demi langkah yang detail, praktis, dan strategis untuk seorang Advokat yang menangani perkara pidana.

    Informasi Kasus:
    - Jenis Perkara: ${caseType}
    - Posisi Klien: ${casePosition}
    - Deskripsi Singkat Kasus: ${description}

    Berdasarkan informasi di atas, buatkan panduan beracara pidana yang komprehensif.
    Uraikan setiap tahapan proses beracara secara kronologis, mulai dari tingkat penyidikan, penuntutan, pemeriksaan di pengadilan, hingga upaya hukum.
    Untuk setiap tahapan, sertakan:
    1.  Penjelasan detail tentang apa yang harus dilakukan.
    2.  Daftar dokumen penting yang harus disiapkan.
    3.  Tips strategis yang relevan untuk memaksimalkan peluang keberhasilan klien.

    Pastikan output Anda sesuai dengan skema JSON yang telah ditentukan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GUIDE_SCHEMA,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const guide = JSON.parse(jsonText);
    return guide as CaseGuide;
  } catch (error) {
    console.error("Error generating case guide:", error);
    throw new Error("Gagal menghasilkan panduan. Silakan coba lagi.");
  }
};