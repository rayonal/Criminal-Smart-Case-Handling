
import React, { useState } from 'react';
import { CaseType, CasePosition, CaseData } from '../types';

interface CaseInputFormProps {
  onSubmit: (data: CaseData) => void;
  isLoading: boolean;
}

const CaseInputForm: React.FC<CaseInputFormProps> = ({ onSubmit, isLoading }) => {
  const [caseType, setCaseType] = useState<CaseType>(CaseType.PERDATA);
  const [casePosition, setCasePosition] = useState<CasePosition>(CasePosition.PENGGUGAT);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit({ caseType, casePosition, description });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="caseType" className="block text-sm font-medium text-slate-300 mb-2">
            Jenis Perkara
          </label>
          <div className="relative">
            <select
              id="caseType"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as CaseType)}
              disabled={isLoading}
              className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500 transition duration-150 ease-in-out p-3 appearance-none"
            >
              {Object.values(CaseType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="casePosition" className="block text-sm font-medium text-slate-300 mb-2">
            Posisi Anda
          </label>
           <div className="relative">
            <select
              id="casePosition"
              value={casePosition}
              onChange={(e) => setCasePosition(e.target.value as CasePosition)}
              disabled={isLoading}
              className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500 transition duration-150 ease-in-out p-3 appearance-none"
            >
              {Object.values(CasePosition).map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          Deskripsi Singkat Kasus
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="Contoh: Sengketa wanprestasi terkait perjanjian jual beli tanah seluas 500 m2 di Jakarta Selatan..."
          className="w-full min-h-[100px] bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500 transition duration-150 ease-in-out p-3 resize-y"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
        >
          {isLoading ? 'Memproses...' : 'Buat Panduan Acara'}
        </button>
      </div>
    </form>
  );
};

export default CaseInputForm;