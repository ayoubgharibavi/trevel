import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

interface SortTabsProps {
  activeSort: string;
  onSortChange: (sort: string) => void;
}

export const SortTabs: React.FC<SortTabsProps> = ({
  activeSort,
  onSortChange
}) => {
  const { language } = useLocalization();
  
  const sortOptions = [
    { id: 'cheapest', label: language === 'en' ? 'Cheapest' : 'ارزان‌ترین' },
    { id: 'fastest', label: language === 'en' ? 'Fastest' : 'سریع‌ترین' },
    { id: 'sort', label: language === 'en' ? 'Sort' : 'مرتب‌سازی' },
    { id: 'other', label: language === 'en' ? 'Others' : 'سایر' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                console.log('🔄 Sort button clicked:', option.id);
                onSortChange(option.id);
              }}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors touch-manipulation min-h-[44px] flex items-center justify-center ${
                activeSort === option.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
          {language === 'en' ? 'Prices and baggage allowance are for one adult.' : 'قیمت‌ها و بار چمدان برای یک بزرگسال می‌باشد.'}
        </div>
      </div>
    </div>
  );
};
