import React from 'react';
import { CaseGuide, GuideStep } from '../types';

interface CaseGuideDisplayProps {
  guide: CaseGuide;
  onDownload: () => void;
}

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-4-4A1 1 0 0013.586 3H4zm3 6a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
  </svg>
);

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM9.293 15.707a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM5.757 5.657a1 1 0 011.414-1.414l-.707.707a1 1 0 01-1.414 1.414l.707-.707zM10 5a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1zM10 15a4 4 0 110-8 4 4 0 010 8z" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);


const GuideStepCard: React.FC<{ step: GuideStep, index: number, isLast: boolean }> = ({ step, index, isLast }) => {
    return (
        <li className="relative flex gap-x-6">
            {!isLast && <div className="absolute left-4 top-5 -ml-px h-full w-0.5 bg-slate-700"></div>}
            
            <div className="relative flex h-8 w-8 flex-none items-center justify-center bg-slate-900">
                <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center ring-8 ring-slate-900 text-slate-900 font-bold">
                    {index + 1}
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl w-full hover:border-sky-500/80 transition-colors duration-300 mb-8">
                <h3 className="text-xl font-bold text-sky-400 mb-3">{step.tahap}</h3>
                <p className="text-slate-300 mb-6">{step.deskripsi}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-3 flex items-center"><DocumentIcon className="w-5 h-5 mr-2 text-teal-400"/>Dokumen Penting</h4>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {step.dokumenPenting.map((doc, i) => (
                                <li key={i} className="text-slate-400">{doc}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-3 flex items-center"><LightbulbIcon className="w-5 h-5 mr-2 text-amber-400"/>Tips Strategis</h4>
                        <p className="text-slate-400 bg-slate-900/50 p-4 rounded-lg border-l-4 border-amber-400">{step.tips}</p>
                    </div>
                </div>
            </div>
        </li>
    );
};

const CaseGuideDisplay: React.FC<CaseGuideDisplayProps> = ({ guide, onDownload }) => {
  return (
    <div className="mt-12 animate-fade-in">
      <div className="flex justify-center items-center gap-4 mb-4">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-200">
          {guide.judulPanduan}
        </h2>
        <button
          onClick={onDownload}
          title="Unduh Panduan"
          aria-label="Unduh Panduan sebagai file .txt"
          className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-900/50 rounded-full transition-colors duration-200"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">Panduan langkah demi langkah yang dihasilkan oleh AI untuk kasus Anda.</p>
      
      <ol>
        {guide.tahapan.map((step, index) => (
          <GuideStepCard key={index} step={step} index={index} isLast={index === guide.tahapan.length - 1}/>
        ))}
      </ol>
    </div>
  );
};

export default CaseGuideDisplay;