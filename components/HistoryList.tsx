import React from 'react';
import { CaseGuide } from '../types';

interface HistoryListProps {
    history: CaseGuide[];
    onLoad: (guide: CaseGuide) => void;
    onDelete: (index: number) => void;
    onDownload: (guide: CaseGuide) => void;
}

const HistoryIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DeleteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);


const HistoryList: React.FC<HistoryListProps> = ({ history, onLoad, onDelete, onDownload }) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {history.map((guide, index) => (
                <div 
                    key={index} 
                    className="bg-slate-800/60 border border-slate-700 rounded-lg shadow-md group transition-all duration-300 hover:border-sky-600 hover:bg-slate-800"
                >
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center min-w-0">
                             <HistoryIcon className="w-5 h-5 mr-4 text-slate-500 flex-shrink-0" />
                            <p className="text-slate-200 font-medium truncate">{guide.judulPanduan}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 pl-4">
                             <button
                                onClick={() => onLoad(guide)}
                                title={`Muat panduan: ${guide.judulPanduan}`}
                                aria-label={`Load guide: ${guide.judulPanduan}`}
                                className="px-3 py-1 text-sm font-medium text-sky-300 bg-sky-900/50 hover:bg-sky-900/80 border border-sky-800/70 rounded-md transition-colors duration-200"
                            >
                                Muat
                            </button>
                            <button
                                onClick={() => onDownload(guide)}
                                title={`Unduh panduan: ${guide.judulPanduan}`}
                                aria-label={`Download guide: ${guide.judulPanduan}`}
                                className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-900/50 rounded-full transition-colors duration-200"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onDelete(index)}
                                title={`Hapus panduan: ${guide.judulPanduan}`}
                                aria-label={`Delete guide: ${guide.judulPanduan}`}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors duration-200"
                            >
                               <DeleteIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryList;