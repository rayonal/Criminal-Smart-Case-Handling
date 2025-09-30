// Fix: Implement the main App component to orchestrate the application.
// FIX: Correctly import useState and useEffect from React.
import React, { useState, useEffect } from 'react';
import CaseInputForm from './components/CaseInputForm';
import CaseGuideDisplay from './components/CaseGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import HistoryList from './components/HistoryList';
import LawFirmIdentityForm from './components/LawFirmIdentityForm';
import LegalIcon from './components/icons/LegalIcon';
import WizardStepper from './components/WizardStepper';
import ReviewStep from './components/ReviewStep';
import GuideImplementationWizard from './components/GuideImplementationWizard';
import { generateCaseGuide } from './services/geminiService';
import { createDocxFromGuide } from './services/docxService';
import { CaseData, CaseGuide, LawFirmIdentity, CaseType, CasePosition, Gender, UploadedFileMap, UploadedFile } from './types';

const LOCAL_STORAGE_KEY_HISTORY = 'smart-case-handling-history';
const LOCAL_STORAGE_KEY_FILES = 'smart-case-handling-files';
const WIZARD_STEPS = ['Identitas Kantor', 'Detail Kasus', 'Tinjau & Buat'];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<CaseGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CaseGuide[]>([]);
  const [identity, setIdentity] = useState<LawFirmIdentity>({
    firmName: '', address: '', phone: '', email: '',
  });
  const [caseData, setCaseData] = useState<CaseData>({
      caseType: CaseType.PIDANA,
      casePosition: CasePosition.TERSANGKA_TERDAKWA,
      description: '',
      clientId: '',
      clientIdentity: {
        jenisKelamin: Gender.LAKI_LAKI,
        kewarganegaraan: 'Indonesia',
      },
  });
  const [isImplementingGuide, setIsImplementingGuide] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMap>({});

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY_FILES);
      if (storedFiles) setUploadedFiles(JSON.parse(storedFiles));
    } catch (e) {
      console.error("Gagal memuat data dari local storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error("Gagal menyimpan riwayat ke local storage", e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FILES, JSON.stringify(uploadedFiles));
    } catch (e) {
      console.error("Gagal menyimpan file ke local storage", e);
    }
  }, [uploadedFiles]);
  
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const isNextDisabled = () => {
      if (currentStep === 2) {
          return !caseData.description || caseData.description.trim() === '';
      }
      return false;
  }

  const handleFormSubmit = async () => {
    if (!caseData.description) return;
    setIsLoading(true);
    setGuide(null);
    setError(null);
    try {
      const generatedGuide = await generateCaseGuide(caseData);
      setGuide(generatedGuide);
      setHistory(prev => [generatedGuide, ...prev.filter(h => h.judulPanduan !== generatedGuide.judulPanduan)].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (guideToDownload: CaseGuide) => {
    try {
      const blob = await createDocxFromGuide(guideToDownload, identity);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const clientName = guideToDownload.clientName;
      const baseName = clientName ? `Panduan Pendampingan Pidana - ${clientName}` : guideToDownload.judulPanduan;
      const sanitizedBaseName = baseName.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `${sanitizedBaseName}.docx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal membuat atau mengunduh file DOCX:", error);
      setError("Gagal membuat file dokumen. Silakan coba lagi.");
    }
  };

  const handleLoadFromHistory = (guideToLoad: CaseGuide) => {
    setGuide(guideToLoad);
    setError(null);
    setIsImplementingGuide(false);
    setCurrentStep(WIZARD_STEPS.length + 1); // Move past wizard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteFromHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleReset = () => {
    setGuide(null);
    setError(null);
    setCurrentStep(1);
    setIsImplementingGuide(false);
    setGuideStepIndex(0);
    setCaseData({
      caseType: CaseType.PIDANA,
      casePosition: CasePosition.TERSANGKA_TERDAKWA,
      description: '',
      clientId: '',
      clientIdentity: {
        jenisKelamin: Gender.LAKI_LAKI,
        kewarganegaraan: 'Indonesia',
      },
    });
  };

  const handleStartImplementation = () => {
    setIsImplementingGuide(true);
    setGuideStepIndex(0);
  };

  const handleFileUpload = (guideTitle: string, stepTitle: string, docName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: event.target?.result as string,
      };
      setUploadedFiles(prev => {
        const newGuideFiles = {
          ...(prev[guideTitle] || {}),
          [stepTitle]: {
            ...(prev[guideTitle]?.[stepTitle] || {}),
            [docName]: newFile,
          },
        };
        return { ...prev, [guideTitle]: newGuideFiles };
      });
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      setError("Gagal membaca file yang diunggah.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileDelete = (guideTitle: string, stepTitle: string, docName: string) => {
    setUploadedFiles(prev => {
      const newStepFiles = { ...(prev[guideTitle]?.[stepTitle] || {}) };
      delete newStepFiles[docName];
      const newGuideFiles = { ...(prev[guideTitle] || {}), [stepTitle]: newStepFiles };
      return { ...prev, [guideTitle]: newGuideFiles };
    });
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return (
      <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">
        <p className="font-semibold">Terjadi Kesalahan</p>
        <p>{error}</p>
        <button onClick={handleReset} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">
          Coba Lagi
        </button>
      </div>
    );
    if (isImplementingGuide && guide) {
      return (
        <GuideImplementationWizard
          guide={guide}
          currentStepIndex={guideStepIndex}
          uploadedFiles={uploadedFiles[guide.judulPanduan] || {}}
          onNextStep={() => setGuideStepIndex(prev => prev + 1)}
          onPrevStep={() => setGuideStepIndex(prev => prev - 1)}
          onFinish={handleReset}
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
        />
      );
    }
    if (guide) return (
      <div className="animate-fade-in">
        <CaseGuideDisplay guide={guide} onDownload={() => handleDownload(guide)} onImplement={handleStartImplementation} />
        <div className="text-center mt-12">
          <button onClick={handleReset} className="py-3 px-6 border border-slate-600 rounded-lg shadow-lg text-base font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300">
            Buat Panduan Baru
          </button>
        </div>
      </div>
    );
    
    // Wizard Steps
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} />
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl shadow-slate-950/50 backdrop-blur-sm p-6 md:p-8">
              {currentStep === 1 && <LawFirmIdentityForm identity={identity} setIdentity={setIdentity} isLoading={isLoading} />}
              {currentStep === 2 && <CaseInputForm caseData={caseData} onUpdate={setCaseData} isLoading={isLoading} />}
              {currentStep === 3 && <ReviewStep identity={identity} caseData={caseData} />}
            </div>
            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="py-2 px-5 border border-slate-600 rounded-lg text-base font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                    Sebelumnya
                </button>
                {currentStep < WIZARD_STEPS.length ? (
                    <button
                        onClick={handleNext}
                        disabled={isNextDisabled()}
                        className="py-2 px-5 rounded-lg text-base font-medium text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:bg-slate-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        Berikutnya
                    </button>
                ) : (
                    <button
                        onClick={handleFormSubmit}
                        className="py-2 px-5 rounded-lg text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all duration-300"
                    >
                        Buat Panduan
                    </button>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
           <div className="flex justify-center items-center gap-4 mb-3">
             <LegalIcon className="w-10 h-10 text-sky-400"/>
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                Smart Criminal Case Handling
             </h1>
           </div>
           <p className="text-slate-400 max-w-2xl mx-auto">
            Asisten AI untuk membantu Advokat menyusun panduan beracara pidana di Indonesia secara cepat dan strategis.
           </p>
        </header>

        {renderContent()}
        
        {history.length > 0 && !guide && !isLoading && !isImplementingGuide && (
             <div className="mt-16">
                <h2 className="text-2xl font-bold text-slate-300 mb-6 text-center">Riwayat Panduan</h2>
                <HistoryList 
                    history={history} 
                    onLoad={handleLoadFromHistory}
                    onDelete={handleDeleteFromHistory}
                    onDownload={handleDownload}
                />
            </div>
        )}
      </main>
       <footer className="text-center py-6 px-4">
        <p className="text-sm text-slate-500">
          Powered by Google Gemini. Dibuat sebagai alat bantu dan bukan pengganti nasihat hukum profesional.
        </p>
      </footer>
    </div>
  );
}

export default App;