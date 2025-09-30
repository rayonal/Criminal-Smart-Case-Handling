import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import CaseInputForm from './components/CaseInputForm';
import CaseGuideDisplay from './components/CaseGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import LegalIcon from './components/icons/LegalIcon';
import { generateCaseGuide } from './services/geminiService';
import type { CaseData, CaseGuide } from './types';
import HistoryList from './components/HistoryList';

const LOCAL_STORAGE_KEY = 'smart-case-handling-guides';

const createDocxFromGuide = (guide: CaseGuide): Promise<Blob> => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [new TextRun({ text: guide.judulPanduan, bold: true, size: 32 })],
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "", spacing: { after: 400 } }), // Spacer
                ...guide.tahapan.flatMap((step) => [
                    new Paragraph({
                        text: step.tahap, // FIXED: Removed manual "TAHAP X:" prefix
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                        text: "Deskripsi",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun(step.deskripsi)],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        text: "Dokumen Penting",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 100 },
                    }),
                    ...step.dokumenPenting.map(docItem => new Paragraph({
                        text: docItem,
                        bullet: { level: 0 },
                    })),
                    new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer
                    new Paragraph({
                        text: "Tips Strategis",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun(step.tips)],
                    }),
                ]),
            ],
        }],
    });

    return Packer.toBlob(doc);
};


const App: React.FC = () => {
  const [guide, setGuide] = useState<CaseGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CaseGuide[]>([]);

  useEffect(() => {
    try {
      const storedGuides = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGuides) {
        setHistory(JSON.parse(storedGuides));
      }
    } catch (e) {
      console.error("Failed to load or parse history from local storage", e);
      setHistory([]);
    }
  }, []);


  const handleGenerateGuide = async (data: CaseData) => {
    setIsLoading(true);
    setError(null);
    setGuide(null);
    try {
      const result = await generateCaseGuide(data);
      setGuide(result);
      
      const newHistory = [result, ...history.filter(g => g.judulPanduan !== result.judulPanduan)];
      setHistory(newHistory);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = (guideToLoad: CaseGuide) => {
    setGuide(guideToLoad);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (indexToDelete: number) => {
    const guideToDelete = history[indexToDelete];
    const newHistory = history.filter((_, index) => index !== indexToDelete);
    setHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));

    if (guide && guide.judulPanduan === guideToDelete.judulPanduan) {
        setGuide(null);
    }
  };
  
  const handleDownloadGuide = async (guideToDownload: CaseGuide) => {
    try {
        const blob = await createDocxFromGuide(guideToDownload);
        const filename = `${guideToDownload.judulPanduan.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
        
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

    } catch (error) {
        console.error("Error creating DOCX file:", error);
        alert("Gagal membuat file .docx. Silakan coba lagi.");
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <header className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <LegalIcon className="w-16 h-16 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"/>
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 pb-2">
            Smart Case Handling
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Panduan Beracara Berbasis AI untuk Advokat di Indonesia. Masukkan detail kasus Anda untuk mendapatkan strategi langkah demi langkah.
          </p>
        </header>

        <main>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-900/20 via-transparent to-transparent -z-10"></div>
            <CaseInputForm onSubmit={handleGenerateGuide} isLoading={isLoading} />
          </div>

          <div className="mt-12">
            {isLoading && <LoadingSpinner />}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center animate-fade-in">
                <p className="font-bold">Gagal Membuat Panduan</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {guide && !isLoading && <CaseGuideDisplay guide={guide} onDownload={() => handleDownloadGuide(guide)} />}
          </div>

          {history.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center text-slate-300 mb-8">Riwayat Panduan</h2>
               <HistoryList
                history={history}
                onLoad={handleLoadHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onDownload={handleDownloadGuide}
            />
            </div>
          )}
        </main>
        
        <footer className="text-center mt-20 text-slate-500 text-sm">
            <p>Powered by Google Gemini. © {new Date().getFullYear()} Smart Case Handling.</p>
            <p className="mt-1">Dibuat untuk tujuan demonstrasi dan tidak menggantikan nasihat hukum profesional.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;