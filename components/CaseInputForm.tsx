import React, { useState } from 'react';
import { CaseType, CasePosition, CaseData, ClientIdentity, Gender } from '../types';

interface CaseInputFormProps {
  onSubmit: (data: CaseData) => void;
  isLoading: boolean;
}

const CaseInputForm: React.FC<CaseInputFormProps> = ({ onSubmit, isLoading }) => {
  const [casePosition, setCasePosition] = useState<CasePosition>(CasePosition.TERSANGKA_TERDAKWA);
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientIdentity, setClientIdentity] = useState<Partial<ClientIdentity>>({
    jenisKelamin: Gender.LAKI_LAKI,
    kewarganegaraan: 'Indonesia',
  });

  const handleClientIdentityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setClientIdentity((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, ''); // Hanya izinkan angka

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5, 9)}`; // Batasi tahun hingga 4 digit
    }
    
    setClientIdentity((prev) => ({ ...prev, tanggalLahir: value }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit({ caseType: CaseType.PIDANA, casePosition, description, clientId, clientIdentity });
    }
  };

  const inputStyle = "w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500 transition duration-150 ease-in-out p-3";
  const selectStyle = `${inputStyle} appearance-none`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1">
        <div>
          <label htmlFor="casePosition" className="block text-sm font-medium text-slate-300 mb-2">
            Posisi Klien Anda
          </label>
           <div className="relative">
            <select
              id="casePosition"
              value={casePosition}
              onChange={(e) => setCasePosition(e.target.value as CasePosition)}
              disabled={isLoading}
              className={selectStyle}
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
        <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-2">
          ID Klien
        </label>
        <input
          type="text"
          id="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          disabled={isLoading}
          placeholder="Masukkan ID Klien (opsional)"
          className={inputStyle}
        />
      </div>

       <fieldset className="border-t border-slate-700 pt-6">
        <legend className="text-base font-semibold text-slate-300 px-2 -ml-2">Identitas Klien (Opsional)</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-slate-300 mb-2">Nama Klien</label>
            <input type="text" name="nama" id="nama" value={clientIdentity.nama || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={inputStyle} placeholder="Nama Lengkap"/>
          </div>
          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-slate-300 mb-2">NIK</label>
            <input type="text" name="nik" id="nik" value={clientIdentity.nik || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={inputStyle} placeholder="Nomor Induk Kependudukan"/>
          </div>
          <div>
            <label htmlFor="tempatLahir" className="block text-sm font-medium text-slate-300 mb-2">Tempat Lahir</label>
            <input type="text" name="tempatLahir" id="tempatLahir" value={clientIdentity.tempatLahir || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="tanggalLahir" className="block text-sm font-medium text-slate-300 mb-2">Tanggal Lahir</label>
            <input 
              type="text" 
              name="tanggalLahir" 
              id="tanggalLahir" 
              value={clientIdentity.tanggalLahir || ''} 
              onChange={handleDateChange} 
              disabled={isLoading} 
              className={inputStyle}
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="jenisKelamin" className="block text-sm font-medium text-slate-300 mb-2">Jenis Kelamin</label>
            <div className="relative">
                <select name="jenisKelamin" id="jenisKelamin" value={clientIdentity.jenisKelamin} onChange={handleClientIdentityChange} disabled={isLoading} className={selectStyle}>
                <option value={Gender.LAKI_LAKI}>Laki-laki</option>
                <option value={Gender.PEREMPUAN}>Perempuan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="kewarganegaraan" className="block text-sm font-medium text-slate-300 mb-2">Kewarganegaraan</label>
            <input type="text" name="kewarganegaraan" id="kewarganegaraan" value={clientIdentity.kewarganegaraan || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={inputStyle} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="pekerjaan" className="block text-sm font-medium text-slate-300 mb-2">Pekerjaan</label>
            <input type="text" name="pekerjaan" id="pekerjaan" value={clientIdentity.pekerjaan || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={inputStyle} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="alamat" className="block text-sm font-medium text-slate-300 mb-2">Alamat</label>
            <textarea name="alamat" id="alamat" rows={2} value={clientIdentity.alamat || ''} onChange={handleClientIdentityChange} disabled={isLoading} className={`${inputStyle} resize-y min-h-[60px]`} placeholder="Alamat sesuai KTP"></textarea>
          </div>
        </div>
      </fieldset>

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
          placeholder="Contoh: Klien dituduh melakukan tindak pidana penipuan terkait transaksi jual beli online..."
          className="w-full min-h-[100px] bg-slate-700/50 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500 transition duration-150 ease-in-out p-3 resize-y"
          required
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
        >
          {isLoading ? 'Memproses...' : 'Buat Panduan Acara Pidana'}
        </button>
      </div>
    </form>
  );
};

export default CaseInputForm;