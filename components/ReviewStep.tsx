import React from 'react';
import { LawFirmIdentity, CaseData } from '../types';
import OfficeBuildingIcon from './icons/OfficeBuildingIcon';
import ClientCaseIcon from './icons/ClientCaseIcon';

interface ReviewStepProps {
  identity: LawFirmIdentity;
  caseData: CaseData;
}

const DataRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );
};

const ReviewStep: React.FC<ReviewStepProps> = ({ identity, caseData }) => {
  const { clientIdentity } = caseData;
  const tglLahir = clientIdentity?.tempatLahir && clientIdentity?.tanggalLahir
    ? `${clientIdentity.tempatLahir}, ${clientIdentity.tanggalLahir}`
    : clientIdentity?.tanggalLahir || clientIdentity?.tempatLahir;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center mb-4">
          <OfficeBuildingIcon className="w-6 h-6 mr-3 text-cyan-400" />
          <h3 className="text-lg font-semibold leading-6 text-slate-200">Identitas Kantor Hukum</h3>
        </div>
        <dl className="divide-y divide-slate-700">
          <DataRow label="Nama Kantor" value={identity.firmName} />
          <DataRow label="Alamat" value={identity.address} />
          <DataRow label="Telepon" value={identity.phone} />
          <DataRow label="Email" value={identity.email} />
        </dl>
      </div>

      <div className="border-t border-slate-700 pt-8">
        <div className="flex items-center mb-4">
          <ClientCaseIcon className="w-6 h-6 mr-3 text-cyan-400" />
          <h3 className="text-lg font-semibold leading-6 text-slate-200">Informasi Kasus Klien</h3>
        </div>
        <dl className="divide-y divide-slate-700">
          <DataRow label="Posisi Klien" value={caseData.casePosition} />
          <DataRow label="ID Klien" value={caseData.clientId} />
          <DataRow label="Nama Klien" value={clientIdentity?.nama} />
          <DataRow label="NIK" value={clientIdentity?.nik} />
          <DataRow label="Tempat, Tgl Lahir" value={tglLahir} />
          <DataRow label="Jenis Kelamin" value={clientIdentity?.jenisKelamin} />
          <DataRow label="Agama" value={clientIdentity?.agama} />
          <DataRow label="Kewarganegaraan" value={clientIdentity?.kewarganegaraan} />
          <DataRow label="Pekerjaan" value={clientIdentity?.pekerjaan} />
          <DataRow label="Alamat" value={clientIdentity?.alamat} />
          <DataRow label="Pendidikan" value={clientIdentity?.pendidikan} />
          <DataRow label="Deskripsi Kasus" value={caseData.description} />
        </dl>
      </div>
    </div>
  );
};

export default ReviewStep;