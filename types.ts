
export enum CaseType {
  PERDATA = "Perdata",
  PIDANA = "Pidana",
  PTUN = "Tata Usaha Negara (PTUN)",
  AGAMA = "Agama (Perceraian, Waris, dll)",
  PHI = "Hubungan Industrial (PHI)"
}

export enum CasePosition {
  PENGGUGAT = "Penggugat / Pemohon",
  TERGUGAT = "Tergugat / Termohon"
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
