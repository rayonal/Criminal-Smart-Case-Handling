
import React from 'react';

const LegalIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5" />
      <path d="M12 12h-8.5" />
      <path d="M12 12v8.5" />
      <path d="M12 12l8.5 -4.5" />
      <path d="M16 5.25l-8 4.5" />
    </svg>
  );
};

export default LegalIcon;
