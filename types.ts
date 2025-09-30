// Fix: Define the types used throughout the application.
export enum CaseType {
  PIDANA = "Pidana",
}

export enum CasePosition {
  TERSANGKA_TERDAKWA = "Tersangka/Terdakwa",
  SAKSI = "Saksi",
  KORBAN = "Korban/Pelapor",
}

export enum Gender {
  LAKI_LAKI = "Laki-laki",
  PEREMPUAN = "Perempuan",
}

export interface ClientIdentity {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: Gender;
  kewarganegaraan: string;
  pekerjaan: string;
  alamat: string;
}

export interface CaseData {
  caseType: CaseType;
  casePosition: CasePosition;
  description: string;
  clientId?: string;
  clientIdentity: Partial<ClientIdentity>;
}

export interface GuideStep {
  tahap: string;
  deskripsi: string;
  dokumenPenting: string[];
  tips: string;
}

export interface CaseGuide {
  judulPanduan: string;
  tahapan: GuideStep[];
  clientName?: string;
}

export interface LawFirmIdentity {
  firmName: string;
  address: string;
  phone: string;
  email: string;
}