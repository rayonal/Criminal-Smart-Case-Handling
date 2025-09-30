import { GoogleGenAI } from "@google/genai";
import { CaseData, CaseGuide, ClientIdentity, UploadedFile, LawFirmIdentity } from '../types';
import { GUIDE_SCHEMA } from '../constants';

// FIX: Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePrompt = (caseData: CaseData): string => {
  const { casePosition, description, clientIdentity } = caseData;

  let prompt = `Anda adalah asisten AI ahli hukum yang dirancang untuk membantu advokat di Indonesia.
Tugas Anda adalah membuat panduan beracara yang komprehensif, strategis, dan praktis untuk kasus pidana.

**Informasi Kasus:**
- **Jenis Kasus:** Pidana
- **Posisi Klien:** ${casePosition || 'Tidak disebutkan'}
- **Deskripsi Singkat Kasus:** ${description || 'Tidak ada deskripsi.'}
`;

  if (clientIdentity && Object.values(clientIdentity).some(v => v)) {
    const tglLahir = [clientIdentity.tempatLahir, clientIdentity.tanggalLahir].filter(Boolean).join(', ');
    prompt += `
**Identitas Klien (jika relevan):**
- Nama: ${clientIdentity.nama || 'Tidak ada'}
- NIK: ${clientIdentity.nik || 'Tidak ada'}
- Tempat/Tanggal Lahir: ${tglLahir || 'Tidak ada'}
- Jenis Kelamin: ${clientIdentity.jenisKelamin || 'Tidak ada'}
- Agama: ${clientIdentity.agama || 'Tidak ada'}
- Kewarganegaraan: ${clientIdentity.kewarganegaraan || 'Tidak ada'}
- Pekerjaan: ${clientIdentity.pekerjaan || 'Tidak ada'}
- Alamat: ${clientIdentity.alamat || 'Tidak ada'}
- Pendidikan: ${clientIdentity.pendidikan || 'Tidak ada'}
`;
  }

  prompt += `
**Instruksi:**
Berdasarkan informasi di atas, buatlah panduan langkah demi langkah yang detail untuk advokat yang menangani kasus ini.
Fokus pada proses beracara pidana di Indonesia.
Panduan HARUS terstruktur dalam 7 tahapan berikut. Untuk setiap tahap, kembangkan kontennya agar relevan dengan deskripsi kasus yang diberikan.

**Struktur 7 Tahapan Wajib:**
1.  **Tahap 1: Pendampingan Pra-Penyidikan dan Penyidikan Awal**
2.  **Tahap 2: Analisis Kasus dan Pengumpulan Bukti Pembelaan**
3.  **Tahap 3: Pelimpahan Berkas dan Pertimbangan Praperadilan**
4.  **Tahap 4: Persiapan Persidangan dan Penyusunan Eksepsi**
5.  **Tahap 5: Proses Pembuktian di Persidangan**
6.  **Tahap 6: Tuntutan, Pembelaan (Pledoi), dan Putusan**
7.  **Tahap 7: Upaya Hukum Lanjutan (Banding/Kasasi)**

Untuk setiap tahap di atas, berikan:
1.  **Judul Tahap:** Gunakan judul yang sudah ditentukan di atas (nilai "tahap" dalam JSON).
2.  **Deskripsi:** Penjelasan detail tentang apa yang harus dilakukan pada tahap tersebut, disesuaikan dengan konteks kasus.
3.  **Dokumen Penting:** Daftar dokumen yang harus disiapkan atau diperoleh pada tahap tersebut.
4.  **Tips Strategis:** Saran praktis dan taktis yang dapat membantu advokat pada tahap tersebut.

Pastikan output Anda dalam format JSON yang sesuai dengan skema yang diberikan.
Judul panduan ("judulPanduan" dalam JSON) harus menarik dan mencerminkan esensi dari kasus yang diberikan.
`;

  return prompt;
};

export const generateGuide = async (caseData: CaseData): Promise<CaseGuide> => {
    if (!caseData.description) {
        throw new Error("Deskripsi kasus tidak boleh kosong.");
    }
    
    const prompt = generatePrompt(caseData);
    
    try {
        // FIX: Use ai.models.generateContent instead of deprecated methods.
        // FIX: Ensure correct model name 'gemini-2.5-flash' is used.
        // FIX: Correctly structure the request with model, contents, and config.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: GUIDE_SCHEMA,
            },
        });
        
        // FIX: Access the generated text directly from response.text.
        const jsonText = response.text.trim();
        const guideData = JSON.parse(jsonText);
        
        return guideData as CaseGuide;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Gagal menghasilkan panduan dari AI. Silakan coba lagi.");
    }
};

export const generateEksepsiDraft = async (
    caseData: CaseData, 
    suratDakwaan: UploadedFile, 
    clientIdentity: Partial<ClientIdentity> = {}, 
    lawFirmIdentity: LawFirmIdentity
): Promise<string> => {
  if (!caseData.description) {
    throw new Error("Deskripsi kasus diperlukan untuk membuat draf eksepsi.");
  }
  if (!suratDakwaan) {
    throw new Error("Surat Dakwaan diperlukan untuk membuat draf eksepsi.");
  }

  const prompt = `
    Anda adalah seorang advokat ahli hukum pidana senior di Indonesia.
    Tugas Anda adalah membuat draf "NOTA KEBERATAN (EKSEPSI)" yang lengkap, formal, dan sangat argumentatif, mengikuti format dan struktur hukum yang baku di Indonesia, berdasarkan analisis mendalam terhadap Surat Dakwaan yang terlampir.

    **DATA UNTUK DRAF:**
    - **Kantor Hukum:**
      - Nama: ${lawFirmIdentity.firmName}
      - Alamat: ${lawFirmIdentity.address}
      - Telp/Email: ${lawFirmIdentity.phone} / ${lawFirmIdentity.email}
    - **Identitas Klien/Terdakwa:**
      - Nama: ${clientIdentity.nama || 'Tidak diisi'}
      - Tempat lahir: ${clientIdentity.tempatLahir || 'Tidak diisi'}
      - Umur/tanggal lahir: ${clientIdentity.tanggalLahir || 'Tidak diisi'}
      - Jenis kelamin: ${clientIdentity.jenisKelamin || 'Tidak diisi'}
      - Kebangsaan: ${clientIdentity.kewarganegaraan || 'Indonesia'}
      - Tempat tinggal: ${clientIdentity.alamat || 'Tidak diisi'}
      - Agama: ${clientIdentity.agama || 'Tidak diisi'}
      - Pekerjaan: ${clientIdentity.pekerjaan || 'Tidak diisi'}
      - Pendidikan: ${clientIdentity.pendidikan || 'Tidak diisi'}
    - **Informasi Kasus Tambahan:**
      - Deskripsi Singkat: ${caseData.description}

    **DOKUMEN KUNCI UNTUK ANALISIS:**
    - Surat Dakwaan dari Jaksa Penuntut Umum (terlampir dalam format PDF). Anda harus membaca dan menganalisis isinya secara komprehensif.

    **INSTRUKSI STRUKTUR DAN KONTEN (WAJIB DIIKUTI):**
    Buat draf dengan urutan dan konten sebagai berikut:

    1.  **JUDUL:**
        NOTA KEBERATAN (EKSEPSI)
        (Diikuti dengan detail perkara seperti "Atas Surat Dakwaan Penuntut Umum Nomor:", "DALAM PERKARA PIDANA NOMOR:", dan "ATAS NAMA TERDAKWA:". Ekstrak informasi ini dari Surat Dakwaan terlampir jika memungkinkan, jika tidak, gunakan placeholder).

    2.  **TUJUAN SURAT:**
        Kepada Yang Mulia,
        Majelis Hakim Pemeriksa Perkara Nomor [Nomor Perkara]
        pada Pengadilan [Nama Pengadilan]
        di
        [Kota Pengadilan]

    3.  **PEMBUKAAN:**
        - "Dengan hormat,"
        - Paragraf perkenalan Tim Penasihat Hukum dari kantor hukum yang disebutkan di atas, yang bertindak atas nama Klien berdasarkan Surat Kuasa Khusus.
        - Blok detail identitas Terdakwa persis seperti format di atas.
        - Paragraf pengantar yang menyatakan bahwa setelah pembacaan Surat Dakwaan, Tim Penasihat Hukum mengajukan Nota Keberatan.

    4.  **I. PENDAHULUAN:**
        - Uraikan dasar hukum pengajuan eksepsi (Pasal 156 ayat (1) KUHAP).
        - Jelaskan tujuan eksepsi sebagai wujud penegakan prinsip peradilan yang adil (due process of law) dan bukan untuk menghambat proses peradilan.
        - Tegaskan bahwa keabsahan formal dan kejelasan materiil surat dakwaan adalah syarat mutlak (conditio sine qua non).
        - Akhiri dengan menyatakan bahwa Surat Dakwaan Jaksa Penuntut Umum mengandung cacat fundamental yang berakibat pada ketidakjelasan dan kekaburan (obscuur libel), sehingga harus dinyatakan batal demi hukum.

    5.  **II. POKOK-POKOK KEBERATAN (SUMMARY OF ARGUMENTS):**
        Berdasarkan analisis MENDALAM Anda terhadap Surat Dakwaan terlampir, rangkum poin-poin utama keberatan dalam format daftar. Contoh poin (Anda harus MENGEMBANGKANNYA SENDIRI berdasarkan analisis dokumen):
        - **Keberatan mengenai Syarat Formil (Pasal 143 ayat (2) huruf a KUHAP):** Apakah ada kesalahan/ketidaklengkapan identitas, locus, atau tempus delicti?
        - **Keberatan mengenai Syarat Materiil (Pasal 143 ayat (2) huruf b KUHAP):** Apakah dakwaan kabur (obscuur libel) karena:
          - Uraian perbuatan tidak cermat, jelas, dan lengkap?
          - Adanya kontradiksi internal dalam dakwaan (misal: jumlah kerugian, subjek hukum)?
          - Kegagalan menguraikan peran Terdakwa dalam konstruksi penyertaan (Pasal 55 KUHP)?
          - Kegagalan uraian fakta dalam memenuhi seluruh unsur delik yang didakwakan?
        - **Keberatan mengenai Wewenang Mengadili:** Apakah perkara ini seharusnya masuk ranah hukum administrasi atau perdata (error in objecto)? Apakah pengadilan tidak berwenang (kompetensi absolut/relatif)?

    6.  **III. URAIAN LENGKAP KEBERATAN:**
        Ini adalah bagian inti. Uraikan setiap poin dari "Pokok-Pokok Keberatan" secara detail dan argumentatif dengan sub-judul yang jelas untuk setiap poin.
        - Untuk setiap argumen, **rujuk kembali ke bagian spesifik dari Surat Dakwaan terlampir**.
        - Dukung setiap argumen dengan **dasar hukum (Pasal KUHAP/KUHP), yurisprudensi relevan, Peraturan/Surat Edaran Mahkamah Agung (PERMA/SEMA), dan doktrin (pendapat ahli hukum)**.

    7.  **IV. PENUTUP:**
        - Simpulkan bahwa berdasarkan seluruh uraian, terbukti Surat Dakwaan mengandung cacat formil dan materiil yang fundamental.
        - Tegaskan kembali konsekuensi hukumnya (misalnya, batal demi hukum atau tidak dapat diterima).

    8.  **V. PETITUM (TUNTUTAN):**
        Buat permohonan kepada Majelis Hakim dengan format berikut:
        - "Berdasarkan keseluruhan dalil dan argumentasi hukum..., kami selaku Tim Penasihat Hukum Terdakwa memohon kepada Majelis Hakim... untuk berkenan menjatuhkan Putusan Sela... dengan amar sebagai berikut:"
        - **PRIMAIR:** (Contoh: Menerima dan mengabulkan eksepsi; Menyatakan Surat Dakwaan... Batal Demi Hukum).
        - **ATAU SUBSIDAIR:** (Contoh: Menyatakan Surat Dakwaan... Tidak Dapat Diterima).
        - **DAN SELANJUTNYA:** (Contoh: Menyatakan pemeriksaan tidak dapat dilanjutkan; Membebaskan Terdakwa dari tahanan; Memulihkan hak-hak Terdakwa; Membebankan biaya perkara kepada Negara).

    9.  **PENUTUP SURAT:**
        - "Demikian Nota Keberatan (Eksepsi) ini kami sampaikan..."
        - "Hormat Kami,"
        - "Tim Penasihat Hukum Terdakwa,"

    **OUTPUT:**
    Hasilkan HANYA teks mentah dari draf eksepsi tersebut. Jangan sertakan komentar atau penjelasan tambahan di luar draf.
  `;
  
  try {
    const contents = {
        parts: [
            { text: prompt },
            {
                inlineData: {
                    mimeType: suratDakwaan.type,
                    data: suratDakwaan.data,
                },
            },
        ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for eksepsi draft:", error);
    throw new Error("Gagal menghasilkan draf eksepsi dari AI. Silakan coba lagi.");
  }
};

export const analyzeDocuments = async (caseData: CaseData, files: UploadedFile[]): Promise<string> => {
      if (files.length === 0) {
        throw new Error("Tidak ada file yang diberikan untuk dianalisis.");
      }

      const prompt = `Anda adalah asisten AI ahli hukum Indonesia yang sangat teliti.
      Tugas Anda adalah melakukan analisis hukum mendalam berdasarkan deskripsi kasus dan dokumen-dokumen PDF yang terlampir.

      **Deskripsi Kasus:**
      - Posisi Klien: ${caseData.casePosition || 'Tidak disebutkan'}
      - Deskripsi Singkat: ${caseData.description || 'Tidak ada deskripsi.'}

      **Dokumen Terlampir:**
      ${files.map(f => `- ${f.name}`).join('\n')}

      **Instruksi Analisis:**
      1.  **Identifikasi Isu Hukum Utama:** Tentukan inti permasalahan hukum dari kasus ini berdasarkan semua informasi yang ada.
      2.  **Analisis Dokumen:** Tinjau setiap dokumen yang dilampirkan. Ekstrak fakta-fakta hukum yang relevan, bukti-bukti, dan potensi kelemahan atau kekuatan dari masing-masing dokumen.
      3.  **Kutipan Peraturan:** Sebutkan pasal-pasal yang relevan dari peraturan perundang-undangan Indonesia (KUHP, KUHAP, dll.) yang berkaitan dengan kasus dan dokumen ini. Berikan penjelasan singkat mengapa pasal tersebut relevan.
      4.  **Kekuatan dan Kelemahan:** Berdasarkan analisis Anda, jabarkan poin-poin kekuatan dan kelemahan dari posisi klien.
      5.  **Rekomendasi Strategis:** Berikan rekomendasi langkah-langkah strategis berikutnya yang harus diambil oleh advokat.

      Sajikan hasil analisis Anda dalam format yang jelas, terstruktur, dan mudah dipahami.
      `;

      const contents = {
        parts: [
          { text: prompt },
          ...files.map(file => ({
            inlineData: {
              mimeType: 'application/pdf',
              data: file.data,
            },
          })),
        ],
      };

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
        });
        return response.text;
      } catch (error) {
        console.error("Error calling Gemini API for document analysis:", error);
        throw new Error("Gagal melakukan analisis dokumen dari AI. Pastikan dokumen yang diunggah valid.");
      }
    };