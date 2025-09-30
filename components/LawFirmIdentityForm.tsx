import React, { useState, useEffect } from 'react';
import { LawFirmIdentity } from '../types';
import OfficeBuildingIcon from './icons/OfficeBuildingIcon';

interface LawFirmIdentityFormProps {
  identity: LawFirmIdentity;
  setIdentity: (identity: LawFirmIdentity) => void;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY_IDENTITY = 'smart-case-handling-identity';

const LawFirmIdentityForm: React.FC<LawFirmIdentityFormProps> = ({ identity, setIdentity, isLoading }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Muat dari local storage atau set default pada render awal
  useEffect(() => {
    try {
      const storedIdentity = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY);
      if (storedIdentity) {
        const parsedIdentity = JSON.parse(storedIdentity);
        setIdentity(parsedIdentity);
        setIsCollapsed(!!parsedIdentity.firmName); 
      } else {
        // Jika tidak ada di storage, set dan simpan nilai default
        const defaultIdentity: LawFirmIdentity = {
            firmName: 'Iustitia Caelestis Law Firm',
            address: 'Jl. Terusan Taruna II No. 2, Kelurahan Pasir Endah, Kecamatan Ujungberung, Kota Bandung',
            phone: '022-63740615',
            email: 'iustitia.caelestis@gmail.com',
        };
        setIdentity(defaultIdentity);
        localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(defaultIdentity));
        setIsCollapsed(false); // Buka form untuk pengguna pertama kali
      }
    } catch (e) {
      console.error("Gagal memuat atau mengurai identitas dari local storage", e);
    }
  }, [setIdentity]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedIdentity = { ...identity, [name]: value };
    setIdentity(updatedIdentity);
    // Simpan ke local storage setiap ada perubahan
    localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(updatedIdentity));
  };
  
  const ChevronIcon: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl shadow-slate-950/50 backdrop-blur-sm mb-8 transition-all duration-300">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex justify-between items-center p-4 md:p-5 text-left"
        aria-expanded={!isCollapsed}
        aria-controls="law-firm-identity-form"
      >
        <div className="flex items-center">
            <OfficeBuildingIcon className="w-6 h-6 mr-3 text-cyan-400"/>
            <h2 className="text-lg font-semibold text-slate-200">Identitas Kantor Hukum</h2>
        </div>
        <ChevronIcon isCollapsed={isCollapsed} />
      </button>
      <div
        id="law-firm-identity-form"
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}
      >
        <div className="p-4 md:p-5 border-t border-slate-700 space-y-4">
            <p className="text-sm text-slate-400">Informasi ini akan digunakan pada kop dokumen yang diunduh. Data disimpan di browser Anda.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="firmName" className="block text-sm font-medium text-slate-300 mb-1">Nama Kantor Hukum</label>
                    <input type="text" name="firmName" id="firmName" value={identity.firmName} onChange={handleChange} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-sky-500" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Nomor Telepon</label>
                    <input type="text" name="phone" id="phone" value={identity.phone} onChange={handleChange} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-sky-500" />
                </div>
           </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">Alamat</label>
                <input type="text" name="address" id="address" value={identity.address} onChange={handleChange} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input type="email" name="email" id="email" value={identity.email} onChange={handleChange} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-sky-500" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LawFirmIdentityForm;