
import React from 'react';

interface BookingStepperProps {
    steps: string[];
    activeStep: number;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ steps, activeStep }) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300
                                    ${isActive ? 'bg-accent text-white' : ''}
                                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                                    ${!isActive && !isCompleted ? 'bg-white border-2 border-slate-300 text-slate-500' : ''}
                                `}>
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-xs text-center font-semibold transition-colors duration-300
                                    ${isActive ? 'text-accent' : ''}
                                    ${isCompleted ? 'text-green-600' : 'text-slate-500'}
                                `}>
                                    {step}
                                </p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`flex-auto h-1 transition-colors duration-300
                                    ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}
                                `} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
