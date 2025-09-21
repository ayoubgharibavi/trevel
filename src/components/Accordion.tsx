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
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex justify-between items-center p-6 text-right bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-300"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    {isComplete ? (
                         <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                            <CheckIcon className="w-5 h-5" />
                         </div>
                    ) : (
                         <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                            !
                         </div>
                    )}
                    <span className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-300">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isComplete && (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            تکمیل شده
                        </span>
                    )}
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-6 border-t border-slate-200/60 bg-white/50">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
