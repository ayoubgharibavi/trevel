
import React from 'react';

interface BookingStepperProps {
    steps: string[];
    activeStep: number;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ steps, activeStep }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="relative">
                {/* Background line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
                
                <div className="relative flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;
                        const isUpcoming = index > activeStep;
                        
                        return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                                {/* Step Circle */}
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 transform hover:scale-110
                                    ${isActive 
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100' 
                                        : isCompleted 
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
                                        : 'bg-white border-3 border-slate-300 text-slate-500 shadow-md hover:shadow-lg'
                                    }`}>
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span className="font-bold">{index + 1}</span>
                                    )}
                                    
                                    {/* Active step pulse animation */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                                    )}
                                </div>
                                
                                {/* Step Label */}
                                <div className="mt-4 text-center max-w-24">
                                    <p className={`text-sm font-semibold transition-colors duration-300 leading-tight
                                        ${isActive ? 'text-blue-600' : ''}
                                        ${isCompleted ? 'text-green-600' : ''}
                                        ${isUpcoming ? 'text-slate-500' : ''}
                                    `}>
                                        {step}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
