
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { useLocalization } from '../hooks/useLocalization';

export type SortOption = 'price' | 'duration' | 'best';

interface SortDropdownProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLocalization();
  
  const sortLabels: Record<SortOption, string> = {
    price: t('searchResults.cheapest'),
    duration: t('searchResults.fastest'),
    best: t('searchResults.bestValue'),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: SortOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center items-center w-full rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="font-semibold">{t('searchResults.sort')}</span>
          <span className="mr-2">{sortLabels[selected]}</span>
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-slate-500" />
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
             <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleSelect('best'); }}
              className={`block px-4 py-2 text-sm ${selected === 'best' ? 'font-bold text-primary' : 'text-slate-700'} hover:bg-secondary`}
              role="menuitem"
            >
              {sortLabels['best']}
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleSelect('price'); }}
              className={`block px-4 py-2 text-sm ${selected === 'price' ? 'font-bold text-primary' : 'text-slate-700'} hover:bg-secondary`}
              role="menuitem"
            >
              {sortLabels['price']}
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleSelect('duration'); }}
              className={`block px-4 py-2 text-sm ${selected === 'duration' ? 'font-bold text-primary' : 'text-slate-700'} hover:bg-secondary`}
              role="menuitem"
            >
              {sortLabels['duration']}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};