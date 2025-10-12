import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { PlaneIcon } from './icons/PlaneIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { XIcon } from './icons/XIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface PersianResultsHeaderProps {
  searchQuery?: {
    from: string;
    to: string;
    departureDate: string | Date;
    passengers?: {
      adults: number;
      children: number;
      infants: number;
    };
  };
  flights?: any[];
  filteredFlights?: any[];
  onSearch?: (newSearchQuery: any) => void;
}

export const PersianResultsHeader: React.FC<PersianResultsHeaderProps> = ({
  searchQuery,
  flights = [],
  filteredFlights = [],
  onSearch
}) => {
  const { language, t } = useLocalization();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [newSearchQuery, setNewSearchQuery] = useState(searchQuery || {});
  
  const totalPassengers = searchQuery?.passengers ? 
    (searchQuery.passengers.adults || 0) + (searchQuery.passengers.children || 0) + (searchQuery.passengers.infants || 0) : 
    1;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(newSearchQuery);
    }
    setIsSearchModalOpen(false);
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setNewSearchQuery(prev => ({
      ...prev,
      passengers: {
        adults: prev.passengers?.adults || 1,
        children: prev.passengers?.children || 0,
        infants: prev.passengers?.infants || 0,
        [type]: Math.max(0, (prev.passengers?.[type] || 0) + delta)
      }
    }));
  };

  return (
    <>
      <div className="bg-white shadow-sm border-b" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors cursor-pointer"
              >
                <SearchIcon className="w-4 h-4 text-gray-700" />
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{language === 'en' ? 'Friday, October 10' : 'جمعه، ۱۰ اکتبر'}</span>
                <span className="mx-2">•</span>
                <span className="font-medium">{totalPassengers} {language === 'en' ? 'passengers, Economy' : 'مسافر، اکونومی'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <PlaneIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800 hidden sm:block">
                  {language === 'en' ? `Flight tickets ${searchQuery.from} to ${searchQuery.to}` : `بلیط هواپیما ${searchQuery.from} به ${searchQuery.to}`}
                </span>
                <span className="text-sm font-medium text-gray-800 sm:hidden">
                  {language === 'en' ? `${searchQuery.from} → ${searchQuery.to}` : `${searchQuery.from} ← ${searchQuery.to}`}
                </span>
              </div>
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{language === 'en' ? 'Search Flights Again' : 'جستجوی مجدد پرواز'}</h2>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* From and To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'From' : 'مبدا'}</label>
                  <input
                    type="text"
                    value={newSearchQuery.from}
                    onChange={(e) => setNewSearchQuery(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={language === 'en' ? 'Origin city or airport' : 'شهر یا فرودگاه مبدا'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'To' : 'مقصد'}</label>
                  <input
                    type="text"
                    value={newSearchQuery.to}
                    onChange={(e) => setNewSearchQuery(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={language === 'en' ? 'Destination city or airport' : 'شهر یا فرودگاه مقصد'}
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Departure Date' : 'تاریخ پرواز'}</label>
                <input
                  type="date"
                  value={typeof newSearchQuery.departureDate === 'string' ? newSearchQuery.departureDate : newSearchQuery.departureDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewSearchQuery(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Number of Passengers' : 'تعداد مسافران'}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-700">{language === 'en' ? 'Adult' : 'بزرگسال'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePassengerChange('adults', -1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{newSearchQuery.passengers?.adults || 1}</span>
                      <button
                        onClick={() => handlePassengerChange('adults', 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-700">{language === 'en' ? 'Child' : 'کودک'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePassengerChange('children', -1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{newSearchQuery.passengers?.children || 0}</span>
                      <button
                        onClick={() => handlePassengerChange('children', 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-700">{language === 'en' ? 'Infant' : 'نوزاد'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePassengerChange('infants', -1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{newSearchQuery.passengers?.infants || 0}</span>
                      <button
                        onClick={() => handlePassengerChange('infants', 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'انصراف'}
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'en' ? 'Search' : 'جستجو'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
