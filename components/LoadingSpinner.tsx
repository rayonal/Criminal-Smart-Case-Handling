
import React, { useState, useEffect } from 'react';

const messages = [
  "Menganalisis preseden hukum terkait...",
  "Menyusun strategi beracara yang optimal...",
  "Mengidentifikasi dokumen kunci...",
  "Hampir selesai, memformat panduan..."
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg animate-pulse">
      <svg
        className="animate-spin h-10 w-10 text-sky-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <h3 className="mt-4 text-lg font-medium text-slate-200">
        AI sedang menyusun panduan...
      </h3>
      <p className="mt-2 text-sm text-slate-400 transition-opacity duration-500 h-5">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingSpinner;