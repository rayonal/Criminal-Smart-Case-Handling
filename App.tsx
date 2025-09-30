import React, { useState, useEffect } from 'react';
import CaseInputForm from './components/CaseInputForm';
import CaseGuideDisplay from './components/CaseGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import HistoryList from './components/HistoryList';
import LawFirmIdentityForm from './components/LawFirmIdentityForm';
import ReviewStep from './components/ReviewStep';
import WizardStepper from './components/WizardStepper';
import GuideImplementationWizard from './components/GuideImplementationWizard';
import LegalIcon from './components/icons/LegalIcon';
import { generateGuide } from './services/geminiService';
import { downloadDocx } from './services/docxService';
import { CaseData, CaseGuide, CasePosition, ClientIdentity, LawFirmIdentity } from './types';

const STEPS = ["Identitas Kantor", "Data Kasus", "Review & Buat"];
const LOCAL_STORAGE_KEY_HISTORY = 'smart-case-handling-history';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [identity, setIdentity] = useState<LawFirmIdentity>({
    firmName: '', address: '', phone: '', email: ''
  });

  const [caseData, setCaseData] = useState<CaseData>({
    casePosition: CasePosition.TERSANGKA_TERDAKWA,
    description: '',
    clientId: '',
    clientIdentity: {},
  });
  
  const [currentGuide, setCurrentGuide] = useState<CaseGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CaseGuide[]>([]);
  const [showImplementationWizard, setShowImplementationWizard] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Gagal memuat riwayat dari local storage", e);
    }
  }, []);

  const updateHistory = (newHistory: CaseGuide[]) => {
    setHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
  };

  const handleGenerateGuide = async () => {
    if (!caseData.description) {
      setError("Deskripsi kasus wajib diisi.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentGuide(null);

    try {
      const guide = await generateGuide(caseData);
      const guideWithClientName = { ...guide, clientName: caseData.clientIdentity?.nama || caseData.clientId || 'Klien' };
      setCurrentGuide(guideWithClientName);
      updateHistory([guideWithClientName, ...history]);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
      setCurrentStep(1); // Reset to first step after generation
    }
  };
  
  const handleReset = () => {
    setCaseData({
      casePosition: CasePosition.TERSANGKA_TERDAKWA,
      description: '',
      clientId: '',
      clientIdentity: {},
    });
    setCurrentGuide(null);
    setError(null);
    setShowImplementationWizard(false);
    setCurrentStep(1);
  };
  
  const handleDownloadGuide = (guideToDownload: CaseGuide) => {
    const clientIdentity: Partial<ClientIdentity> | undefined = guideToDownload.clientName === (caseData.clientIdentity?.nama || caseData.clientId || 'Klien') 
      ? caseData.clientIdentity 
      : undefined;
      
    downloadDocx(guideToDownload, identity, clientIdentity);
  };
  
  const handleLoadFromHistory = (guide: CaseGuide) => {
    setCurrentGuide(guide);
    setShowImplementationWizard(false);
    // Optionally, you could try to find matching case data, but for now just show the guide
  };

  const handleDeleteFromHistory = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    updateHistory(newHistory);
  };

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === STEPS.length) {
        handleGenerateGuide();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <LawFirmIdentityForm identity={identity} setIdentity={setIdentity} isLoading={isLoading} />;
      case 2:
        return <CaseInputForm caseData={caseData} onUpdate={setCaseData} isLoading={isLoading} />;
      case 3:
        return <ReviewStep identity={identity} caseData={caseData} />;
      default:
        return null;
    }
  };

  if (showImplementationWizard && currentGuide) {
    return (
      <GuideImplementationWizard
        guide={currentGuide}
        lawFirmIdentity={identity}
        clientIdentity={caseData.clientIdentity}
        caseData={caseData}
        onClose={() => setShowImplementationWizard(false)}
        onDownload={handleDownloadGuide}
      />
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <LegalIcon className="w-12 h-12 text-sky-400" />
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-400">
                Smart Case Handling
              </h1>
            </div>
          <p className="text-slate-400 text-lg">Asisten AI untuk Panduan Beracara Pidana</p>
        </header>

        <main className="bg-slate-800/50 border border-slate-700 p-6 sm:p-10 rounded-3xl shadow-2xl shadow-sky-900/20">
            {currentGuide ? (
                <div className="animate-fade-in">
                    <CaseGuideDisplay
                        guide={currentGuide}
                        onDownload={() => handleDownloadGuide(currentGuide)}
                        onImplement={() => setShowImplementationWizard(true)}
                    />
                    <div className="text-center mt-8">
                      <button
                          onClick={handleReset}
                          className="py-2 px-5 rounded-lg text-base font-semibold text-sky-300 bg-sky-900/50 hover:bg-sky-900/80 border border-sky-800/70 transition-colors duration-200"
                      >
                          Buat Panduan Baru
                      </button>
                    </div>
                </div>
            ) : isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="space-y-8">
                  <WizardStepper steps={STEPS} currentStep={currentStep} />
                  
                  <div className="min-h-[300px] py-4">
                     {renderCurrentStep()}
                  </div>
                 
                  <div className="flex justify-between items-center border-t border-slate-700 pt-6">
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStep === 1 || isLoading}
                      className="py-2 px-5 rounded-lg text-base font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={isLoading || (currentStep === 2 && !caseData.description)}
                      className="py-2.5 px-8 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStep === STEPS.length ? 'Buat Panduan' : 'Lanjutkan'}
                    </button>
                  </div>
                   {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                </div>
            )}
        </main>
        
         {!isLoading && !currentGuide && history.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-300 mb-4 text-center">Riwayat Panduan</h2>
            <HistoryList
              history={history}
              onLoad={handleLoadFromHistory}
              onDelete={handleDeleteFromHistory}
              onDownload={handleDownloadGuide}
            />
          </section>
        )}

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Google Gemini. Dibuat untuk tujuan demonstrasi.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;