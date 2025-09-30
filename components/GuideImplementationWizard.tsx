import React, { useRef } from 'react';
import { CaseGuide, GuideStep, UploadedFileMap } from '../types';

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

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface GuideImplementationWizardProps {
  guide: CaseGuide;
  currentStepIndex: number;
  uploadedFiles: Record<string, Record<string, any>>;
  onNextStep: () => void;
  onPrevStep: () => void;
  onFinish: () => void;
  onFileUpload: (guideTitle: string, stepTitle: string, docName: string, file: File) => void;
  onFileDelete: (guideTitle: string, stepTitle: string, docName: string) => void;
}

const GuideImplementationWizard: React.FC<GuideImplementationWizardProps> = ({
  guide,
  currentStepIndex,
  uploadedFiles,
  onNextStep,
  onPrevStep,
  onFinish,
  onFileUpload,
  onFileDelete,
}) => {
  const totalSteps = guide.tahapan.length;
  const currentStepData = guide.tahapan[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(guide.judulPanduan, currentStepData.tahap, docName, file);
    }
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-300">{guide.judulPanduan}</h2>
        <p className="text-slate-400 mt-1">
          Tahap {currentStepIndex + 1} dari {totalSteps}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2.5 mb-8">
        <div
          className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-6 md:p-8 rounded-2xl w-full">
        <h3 className="text-2xl font-bold text-sky-400 mb-4">{currentStepData.tahap}</h3>
        <p className="text-slate-300 mb-8">{currentStepData.deskripsi}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 flex items-center">
              <DocumentIcon className="w-5 h-5 mr-2 text-teal-400"/>Dokumen Penting
            </h4>
            <ul className="space-y-3">
              {currentStepData.dokumenPenting.map((doc, i) => {
                const uploadedFile = uploadedFiles[currentStepData.tahap]?.[doc];
                return (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-slate-400 flex-grow mb-2 sm:mb-0">{doc}</span>
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 text-sm flex-shrink-0">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-slate-300 truncate max-w-[120px]" title={uploadedFile.name}>{uploadedFile.name}</span>
                        <button onClick={() => onFileDelete(guide.judulPanduan, currentStepData.tahap, doc)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, doc)}
                          accept=".pdf"
                          className="hidden"
                        />
                        <button 
                          onClick={handleUploadClick}
                          className="flex items-center gap-2 text-sm font-medium text-sky-300 bg-sky-900/50 hover:bg-sky-900/80 border border-sky-800/70 rounded-md px-3 py-1 transition-colors duration-200 flex-shrink-0"
                        >
                          <UploadIcon className="w-4 h-4" />
                          Unggah
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 flex items-center">
              <LightbulbIcon className="w-5 h-5 mr-2 text-amber-400"/>Tips Strategis
            </h4>
            <p className="text-slate-400 bg-slate-900/50 p-4 rounded-lg border-l-4 border-amber-400">{currentStepData.tips}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrevStep}
          disabled={currentStepIndex === 0}
          className="py-2 px-5 border border-slate-600 rounded-lg text-base font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Sebelumnya
        </button>
        {currentStepIndex < totalSteps - 1 ? (
          <button
            onClick={onNextStep}
            className="py-2 px-5 rounded-lg text-base font-medium text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 transition-all duration-300"
          >
            Berikutnya
          </button>
        ) : (
          <button
            onClick={onFinish}
            className="py-2 px-5 rounded-lg text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all duration-300"
          >
            Selesai
          </button>
        )}
      </div>
    </div>
  );
};

export default GuideImplementationWizard;