// Fix: Implement the main App component to orchestrate the application.
import React, { useState, useEffect } from 'react';
import CaseInputForm from './components/CaseInputForm';
import CaseGuideDisplay from './components/CaseGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import HistoryList from './components/HistoryList';
import LawFirmIdentityForm from './components/LawFirmIdentityForm';
import LegalIcon from './components/icons/LegalIcon';
import { generateCaseGuide } from './services/geminiService';
import { createDocxFromGuide } from './services/docxService';
import { CaseData, CaseGuide, LawFirmIdentity } from './types';

const LOCAL_STORAGE_KEY_HISTORY = 'smart-case-handling-history';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<CaseGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CaseGuide[]>([]);
  const [identity, setIdentity] = useState<LawFirmIdentity>({
    firmName: '',
    address: '',
    phone: '',
    email: '',
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error("Gagal menyimpan riwayat ke local storage", e);
    }
  }, [history]);

  const handleFormSubmit = async (data: CaseData) => {
    setIsLoading(true);
    setGuide(null);
    setError(null);
    try {
      const generatedGuide = await generateCaseGuide(data);
      setGuide(generatedGuide);
      // Add to history, prevent duplicates, and limit to 10 items
      setHistory(prevHistory => [generatedGuide, ...prevHistory.filter(h => h.judulPanduan !== generatedGuide.judulPanduan)].slice(0, 10));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
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
      const fileName = `${guideToDownload.judulPanduan.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteFromHistory = (index: number) => {
    setHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };
  
  const handleReset = () => {
    setGuide(null);
    setError(null);
  };

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

        {!guide && !isLoading && (
            <div className="animate-fade-in">
                <LawFirmIdentityForm identity={identity} setIdentity={setIdentity} isLoading={isLoading} />
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl shadow-slate-950/50 backdrop-blur-sm p-6 md:p-8">
                     <CaseInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                </div>
            </div>
        )}

        {isLoading && <LoadingSpinner />}
        
        {error && (
            <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p>{error}</p>
                 <button onClick={handleReset} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">
                    Coba Lagi
                </button>
            </div>
        )}

        {guide && !isLoading && (
            <div className="animate-fade-in">
                <CaseGuideDisplay guide={guide} onDownload={() => handleDownload(guide)} />
                <div className="text-center mt-12">
                     <button 
                        onClick={handleReset} 
                        className="py-3 px-6 border border-slate-600 rounded-lg shadow-lg text-base font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300"
                     >
                        Buat Panduan Baru
                    </button>
                </div>
            </div>
        )}
        
        {history.length > 0 && !guide && !isLoading && (
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