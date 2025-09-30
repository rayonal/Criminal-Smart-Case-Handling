import React, { useEffect } from 'react';
import { LawFirmIdentity } from '../types';
import OfficeBuildingIcon from './icons/OfficeBuildingIcon';

interface LawFirmIdentityFormProps {
  identity: LawFirmIdentity;
  setIdentity: (identity: LawFirmIdentity) => void;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY_IDENTITY = 'smart-case-handling-identity';

const LawFirmIdentityForm: React.FC<LawFirmIdentityFormProps> = ({ identity, setIdentity, isLoading }) => {
  
  useEffect(() => {
    try {
      const storedIdentity = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY);
      if (storedIdentity) {
        setIdentity(JSON.parse(storedIdentity));
      } else {
        const defaultIdentity: LawFirmIdentity = {
            firmName: 'Iustitia Caelestis Law Firm',
            address: 'Jl. Terusan Taruna II No. 2, Kelurahan Pasir Endah, Kecamatan Ujungberung, Kota Bandung',
            phone: '022-63740615',
            email: 'iustitia.caelestis@gmail.com',
        };
        setIdentity(defaultIdentity);
        localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(defaultIdentity));
      }
    } catch (e) {
      console.error("Gagal memuat atau mengurai identitas dari local storage", e);
    }
  }, [setIdentity]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedIdentity = { ...identity, [name]: value };
    setIdentity(updatedIdentity);
    localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(updatedIdentity));
  };
  
  return (
    <div className="transition-all duration-300">
      <div className="flex items-center mb-6">
          <OfficeBuildingIcon className="w-7 h-7 mr-3 text-cyan-400"/>
          <h2 className="text-xl font-semibold text-slate-200">Identitas Kantor Hukum</h2>
      </div>
      <div className="space-y-4">
          <p className="text-sm text-slate-400 -mt-4">Informasi ini akan digunakan pada kop dokumen yang diunduh. Data disimpan di browser Anda.</p>
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
  );
};

export default LawFirmIdentityForm;
