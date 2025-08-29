
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!query) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [options, query]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                 <input
                    type="text"
                    className="w-full p-2 pr-8 border rounded bg-white text-sm"
                    value={isOpen ? query : selectedOption?.label || ''}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                />
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute top-1/2 right-2 -translate-y-1/2">
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
           
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 ${value === option.value ? 'bg-blue-50 font-semibold' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-sm text-slate-500">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
};
