import React, { useState, useRef, useEffect } from 'react';
import { CaseGuide, LawFirmIdentity, ClientIdentity, UploadedFile, UploadedFileMap, CaseData } from '../types';
import { generateEksepsiDraft, analyzeDocuments } from '../services/geminiService';
import { downloadEksepsiDocx } from '../services/docxService';


// Icons
const CloseIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const FileIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-4-4A1 1 0 0013.586 3H4zm3 6a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
  </svg>
);
const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const InlineSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center gap-2 text-slate-300 p-4">
        <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);


// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

interface GuideImplementationWizardProps {
  guide: CaseGuide;
  lawFirmIdentity: LawFirmIdentity;
  clientIdentity?: Partial<ClientIdentity>;
  caseData: CaseData;
  onClose: () => void;
  onDownload: (guide: CaseGuide) => void;
}

const GuideImplementationWizard: React.FC<GuideImplementationWizardProps> = ({
  guide,
  lawFirmIdentity,
  clientIdentity,
  caseData,
  onClose,
  onDownload
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMap>({});
  const [isGeneratingEksepsi, setIsGeneratingEksepsi] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadInfo = useRef<{guideTitle: string, stepTitle: string, docName: string} | null>(null);
  
  const localStorageKey = `uploaded-files-${guide.judulPanduan}-${caseData.clientId || ''}`;

  useEffect(() => {
    try {
        const storedFiles = localStorage.getItem(localStorageKey);
        if (storedFiles) {
            setUploadedFiles(JSON.parse(storedFiles));
        }
    } catch (e) {
        console.error("Gagal memuat file dari local storage", e);
    }
  }, [localStorageKey]);

  useEffect(() => {
    try {
        if (Object.keys(uploadedFiles).length > 0) {
            localStorage.setItem(localStorageKey, JSON.stringify(uploadedFiles));
        } else {
            localStorage.removeItem(localStorageKey);
        }
    } catch (e) {
        console.error("Gagal menyimpan file ke local storage", e);
    }
  }, [uploadedFiles, localStorageKey]);
  
  const handleNextStage = () => {
    if (currentStageIndex < guide.tahapan.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
      setAnalysisResult(null); // Clear analysis result when changing stage
    }
  };

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1);
      setAnalysisResult(null); // Clear analysis result when changing stage
    }
  };

  const currentStage = guide.tahapan[currentStageIndex];


  const triggerFileInput = (guideTitle: string, stepTitle: string, docName: string) => {
    currentUploadInfo.current = { guideTitle, stepTitle, docName };
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUploadInfo.current) return;
    
    if (file.type !== 'application/pdf') {
        alert('Hanya file dengan format PDF yang diizinkan.');
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    const { guideTitle, stepTitle, docName } = currentUploadInfo.current;
    const base64Data = await fileToBase64(file);
    
    const newFile: UploadedFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64Data,
    };
    
    setUploadedFiles(prev => ({
      ...prev,
      [guideTitle]: {
        ...prev[guideTitle],
        [stepTitle]: {
          ...prev[guideTitle]?.[stepTitle],
          [docName]: newFile
        }
      }
    }));

    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    currentUploadInfo.current = null;
  };

  const removeFile = (guideTitle: string, stepTitle: string, docName: string) => {
     setUploadedFiles(prev => {
        const updatedStep = { ...prev[guideTitle]?.[stepTitle] };
        delete updatedStep[docName];
        return {
            ...prev,
            [guideTitle]: {
                ...prev[guideTitle],
                [stepTitle]: updatedStep
            }
        };
     });
  };

  const handleGenerateEksepsi = async () => {
    const uploadedFilesInCurrentStage = uploadedFiles[guide.judulPanduan]?.[currentStage.tahap];
    
    const suratDakwaanKey = uploadedFilesInCurrentStage 
        ? Object.keys(uploadedFilesInCurrentStage).find(key => key.toLowerCase().includes('dakwaan')) 
        : undefined;

    const suratDakwaanFile = suratDakwaanKey ? uploadedFilesInCurrentStage[suratDakwaanKey] : undefined;

    if (!suratDakwaanFile) {
      alert("Silakan unggah Surat Dakwaan terlebih dahulu untuk membuat draf eksepsi.");
      return;
    }

    setIsGeneratingEksepsi(true);
    try {
      const draftText = await generateEksepsiDraft(caseData, suratDakwaanFile, clientIdentity, lawFirmIdentity);
      downloadEksepsiDocx(draftText, lawFirmIdentity, clientIdentity?.nama);
    } catch (error) {
      console.error("Gagal membuat dan mengunduh eksepsi:", error);
      alert((error as Error).message || "Terjadi kesalahan saat membuat draf.");
    } finally {
      setIsGeneratingEksepsi(false);
    }
  };
  
  const handleAnalyzeDocuments = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        const allFiles: UploadedFile[] = Object.values(uploadedFiles)
            .flatMap(stage => Object.values(stage))
            .flatMap(doc => Object.values(doc));

        if (allFiles.length === 0) {
            alert("Tidak ada dokumen yang diunggah untuk dianalisis.");
            return;
        }

        const result = await analyzeDocuments(caseData, allFiles);
        setAnalysisResult(result);
    } catch (error) {
        console.error("Gagal menganalisis dokumen:", error);
        setAnalysisResult(`Terjadi kesalahan saat menganalisis: ${(error as Error).message}`);
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const totalUploadedDocs = Object.values(uploadedFiles)
    .flatMap(Object.values)
    .length;


  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-sky-400">{guide.judulPanduan}</h2>
                  <p className="text-sm text-slate-400">Manajemen Dokumen Implementasi</p>
                </div>
                <div className="flex items-center gap-2">
                   <button
                        onClick={() => onDownload(guide)}
                        title="Unduh Panduan"
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-900/50 rounded-full transition-colors"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <div className="p-6 overflow-y-auto">
                 <div className="mb-6 text-center">
                  <p className="text-sm font-medium text-slate-400">
                    Tahap {currentStageIndex + 1} dari {guide.tahapan.length}
                  </p>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{currentStage.tahap}</h3>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                    <div 
                      className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${((currentStageIndex + 1) / guide.tahapan.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="animate-fade-in">
                  <p className="text-slate-300 mb-6">{currentStage.deskripsi}</p>
                  <h4 className="font-semibold text-slate-200 mb-3">Dokumen yang Diperlukan:</h4>
                  <ul className="space-y-3">
                    {currentStage.dokumenPenting.length > 0 ? currentStage.dokumenPenting.map((doc, docIndex) => {
                      const uploadedFile = uploadedFiles[guide.judulPanduan]?.[currentStage.tahap]?.[doc];
                      const isEksepsi = doc.toLowerCase().includes('eksepsi');
                      const isEksepsiStage = currentStage.tahap.toLowerCase().includes('persidangan') || currentStage.tahap.toLowerCase().includes('eksepsi');
                      
                      const uploadedFilesInCurrentStage = uploadedFiles[guide.judulPanduan]?.[currentStage.tahap];
                      const suratDakwaanUploaded = uploadedFilesInCurrentStage 
                          ? Object.keys(uploadedFilesInCurrentStage).some(fileName => fileName.toLowerCase().includes('dakwaan'))
                          : false;
                      
                      return (
                         <li key={docIndex} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-md gap-2">
                              <div className="flex items-center min-w-0">
                                  {uploadedFile ? 
                                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0"/> : 
                                    <FileIcon className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0"/>
                                  }
                                  <span className="text-slate-300 truncate" title={doc}>{doc}</span>
                              </div>

                              <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                                  {isEksepsi && isEksepsiStage && (
                                      <button
                                        onClick={handleGenerateEksepsi}
                                        disabled={!suratDakwaanUploaded || isGeneratingEksepsi}
                                        className="text-sm font-medium text-amber-400 hover:text-amber-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                                        title={!suratDakwaanUploaded ? "Unggah Surat Dakwaan terlebih dahulu" : "Buat draf eksepsi dengan AI"}
                                      >
                                        {isGeneratingEksepsi ? 'Membuat...' : 'Buat Draf Eksepsi'}
                                      </button>
                                  )}
                              
                                  {uploadedFile ? (
                                      <div className="flex items-center gap-3">
                                          <span className="text-sm text-slate-400 truncate max-w-[120px]" title={uploadedFile.name}>{uploadedFile.name}</span>
                                          <button onClick={() => removeFile(guide.judulPanduan, currentStage.tahap, doc)} className="text-xs text-red-400 hover:text-red-300 font-semibold">Hapus</button>
                                      </div>
                                  ) : (
                                      <button onClick={() => triggerFileInput(guide.judulPanduan, currentStage.tahap, doc)} className="text-sm font-medium text-sky-400 hover:text-sky-300">
                                        Unggah
                                      </button>
                                  )}
                              </div>
                        </li>
                      )
                    }) : (
                      <li className="text-slate-400 italic">Tidak ada dokumen spesifik yang diperlukan untuk tahap ini.</li>
                    )}
                  </ul>
                </div>

                {isAnalyzing && <InlineSpinner text="AI sedang menganalisis dokumen..." />}
                {analysisResult && (
                    <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in">
                        <h3 className="text-lg font-semibold text-sky-400 mb-2">Hasil Analisis Dokumen</h3>
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{analysisResult}</pre>
                    </div>
                )}
            </div>
             <footer className="flex-shrink-0 border-t border-slate-700 p-4 flex justify-between items-center bg-slate-800">
                 <div>
                    <button
                        onClick={handleAnalyzeDocuments}
                        disabled={isAnalyzing || totalUploadedDocs === 0}
                        className="py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Menganalisis semua dokumen yang telah diunggah di semua tahapan."
                    >
                        {isAnalyzing ? 'Menganalisis...' : `Analisis ${totalUploadedDocs} Dokumen`}
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePrevStage}
                        disabled={currentStageIndex === 0}
                        className="py-2 px-5 rounded-lg text-base font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Kembali
                    </button>
                    {currentStageIndex < guide.tahapan.length - 1 ? (
                        <button
                            onClick={handleNextStage}
                            className="py-2 px-5 rounded-lg text-base font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors"
                        >
                            Lanjutkan
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="py-2 px-5 rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors"
                        >
                            Selesai
                        </button>
                    )}
                </div>
            </footer>
        </div>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf"
        />
    </div>
  );
};

export default GuideImplementationWizard;