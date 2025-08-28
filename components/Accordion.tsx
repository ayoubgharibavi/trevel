import React from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckIcon } from './icons/CheckIcon';

interface AccordionProps {
    title: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isComplete?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, isOpen, onToggle, children, isComplete }) => {
    return (
        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-right bg-slate-50 hover:bg-slate-100 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {isComplete ? (
                         <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                            <CheckIcon className="w-4 h-4" />
                         </div>
                    ) : (
                         <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            !
                         </div>
                    )}
                    <span className="font-bold text-lg text-slate-800">{title}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out grid ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 border-t">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
