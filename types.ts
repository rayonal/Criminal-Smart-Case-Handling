// Fix: Define the types used throughout the application.
export enum CaseType {
  PIDANA = "Pidana",
}

export enum CasePosition {
  TERSANGKA_TERDAKWA = "Tersangka/Terdakwa",
  SAKSI = "Saksi",
  KORBAN = "Korban/Pelapor",
}

export interface CaseData {
  caseType: CaseType;
  casePosition: CasePosition;
  description: string;
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
}

export interface LawFirmIdentity {
  firmName: string;
  address: string;
  phone: string;
  email: string;
}
