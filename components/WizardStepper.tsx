import React from 'react';

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

const CheckIcon = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
)

const WizardStepper: React.FC<WizardStepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStep -1 ? (
              // Completed step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-sky-600" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-sky-600 rounded-full hover:bg-sky-700">
                   <CheckIcon />
                </div>
              </>
            ) : stepIdx === currentStep -1 ? (
              // Current step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-slate-800 border-2 border-sky-500 rounded-full" aria-current="step">
                  <span className="h-2.5 w-2.5 bg-sky-500 rounded-full" />
                </div>
                 <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-sky-400">{step}</span>
              </>
            ) : (
              // Upcoming step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <div className="group relative w-8 h-8 flex items-center justify-center bg-slate-800 border-2 border-slate-600 rounded-full hover:border-slate-400">
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300">{stepIdx + 1}</span>
                </div>
                <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-slate-500">{step}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default WizardStepper;
