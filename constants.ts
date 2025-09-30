
import { Type } from '@google/genai';

export const GUIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    judulPanduan: {
      type: Type.STRING,
      description: 'Judul yang menarik dan relevan untuk panduan kasus ini berdasarkan deskripsi yang diberikan.'
    },
    tahapan: {
      type: Type.ARRAY,
      description: 'Array yang berisi langkah-langkah atau tahapan dalam proses beracara.',
      items: {
        type: Type.OBJECT,
        properties: {
          tahap: {
            type: Type.STRING,
            description: 'Judul singkat untuk tahapan ini, contoh: "Tahap 1: Persiapan Gugatan".'
          },
          deskripsi: {
            type: Type.STRING,
            description: 'Penjelasan detail dalam beberapa kalimat mengenai apa yang harus dilakukan pada tahap ini.'
          },
          dokumenPenting: {
            type: Type.ARRAY,
            description: 'Daftar dokumen penting yang relevan dan perlu disiapkan pada tahap ini.',
            items: {
              type: Type.STRING
            }
          },
          tips: {
            type: Type.STRING,
            description: 'Tips atau saran praktis dan strategis untuk advokat pada tahap ini.'
          }
        },
        required: ['tahap', 'deskripsi', 'dokumenPenting', 'tips']
      }
    }
  },
  required: ['judulPanduan', 'tahapan']
};
