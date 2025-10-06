import React, { useState, useRef, useEffect } from 'react';
import { TripType } from '@/types';
import type { SearchQuery, Passengers, AirportInfo } from '@/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from '@/components/icons/PlaneLandingIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { ArrowRightLeftIcon } from '@/components/icons/ArrowRightLeftIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface FlightSearchFormProps {
  onSearch: (query: SearchQuery) => void;
  onSepehrSearch?: (query: SearchQuery) => void;
  isLoading: boolean;
  airports: AirportInfo[];
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  onSepehrSearch,
  isLoading,
  airports
}) => {
  const { t } = useLocalization();
  const [tripType, setTripType] = useState<TripType>(TripType.OneWay);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState<Passengers>({
    adults: 1,
    children: 0,
    infants: 0
  });
  
  // UI States
  const [isPassengerPopoverOpen, setIsPassengerPopoverOpen] = useState(false);
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  
  // Refs
  const popoverRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  // Extract unique cities from airports with proper parsing
  const uniqueCities = Array.from(new Set(
    airports.map(airport => {
      try {
        const cityData = typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city;
        return cityData?.fa || cityData?.en || airport.city || 'نامشخص';
      } catch {
        return airport.city || 'نامشخص';
      }
    })
  )).filter(city => city && city !== 'نامشخص');

  // Debug: Log cities
  console.log('Available cities:', uniqueCities);

  // Filter cities based on search input
  const filteredFromCities = uniqueCities.filter(city =>
    city.toLowerCase().includes(fromFilter.toLowerCase())
  ).slice(0, 8);

  const filteredToCities = uniqueCities.filter(city =>
    city.toLowerCase().includes(toFilter.toLowerCase())
  ).slice(0, 8);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPassengerPopoverOpen(false);
      }
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setIsFromDropdownOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setIsToDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update filter when from/to changes
  useEffect(() => {
    if (from) {
      setFromFilter(from);
    }
  }, [from]);

  useEffect(() => {
    if (to) {
      setToFilter(to);
    }
  }, [to]);

  const getPassengerText = () => {
    const total = passengers.adults + passengers.children + passengers.infants;
    return `${total} مسافر`;
  };

  const handleSearch = () => {
    if (!from || !to) return;

    const query: SearchQuery = {
      from,
      to,
      departureDate: departureDate.toISOString(),
      returnDate: tripType === TripType.RoundTrip ? returnDate.toISOString() : undefined,
      passengers,
      tripType
    };

    onSearch(query);
  };

  const handleFromSelect = (city: string) => {
    setFrom(city);
    setFromFilter(city);
    setIsFromDropdownOpen(false);
  };

  const handleToSelect = (city: string) => {
    setTo(city);
    setToFilter(city);
    setIsToDropdownOpen(false);
  };

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setFromFilter(to);
    setToFilter(from);
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto border border-blue-100">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          جستجوی پرواز
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          بهترین قیمت‌ها و پروازها را پیدا کنید
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Trip Type Selection */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
          <button
            onClick={() => setTripType(TripType.OneWay)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              tripType === TripType.OneWay
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
            }`}
          >
            {t('search.oneWay')}
          </button>
          <button
            onClick={() => setTripType(TripType.RoundTrip)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg ${
              tripType === TripType.RoundTrip
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
            }`}
          >
            {t('search.roundTrip')}
          </button>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* From Airport */}
          <div className="relative" ref={fromRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t('search.from')}
            </label>
            <div className="relative group">
              <PlaneTakeoffIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                value={fromFilter}
                onChange={(e) => {
                  setFromFilter(e.target.value);
                  setIsFromDropdownOpen(true);
                }}
                onFocus={() => setIsFromDropdownOpen(true)}
                placeholder={t('search.fromPlaceholder')}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
              />
            </div>
            {isFromDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-48 sm:max-h-60 overflow-y-auto">
                {filteredFromCities.length > 0 ? (
                  filteredFromCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleFromSelect(city)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm sm:text-base transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                    شهر یافت نشد
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center sm:justify-start">
            <button
              onClick={swapCities}
              className="p-2 sm:p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <ArrowRightLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* To Airport */}
          <div className="relative" ref={toRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t('search.to')}
            </label>
            <div className="relative group">
              <PlaneLandingIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                value={toFilter}
                onChange={(e) => {
                  setToFilter(e.target.value);
                  setIsToDropdownOpen(true);
                }}
                onFocus={() => setIsToDropdownOpen(true)}
                placeholder={t('search.toPlaceholder')}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
              />
            </div>
            {isToDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-48 sm:max-h-60 overflow-y-auto">
                {filteredToCities.length > 0 ? (
                  filteredToCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleToSelect(city)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm sm:text-base transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                    شهر یافت نشد
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Departure Date */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t('search.departure')}
            </label>
            <div className="relative group">
              <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-500 transition-colors" />
              <input
                type="date"
                value={departureDate.toISOString().split('T')[0]}
                onChange={(e) => setDepartureDate(new Date(e.target.value))}
                min={today}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Return Date - Only show for round trip */}
          {tripType === TripType.RoundTrip && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                {t('search.return')}
              </label>
              <div className="relative group">
                <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-500 transition-colors" />
                <input
                  type="date"
                  value={returnDate.toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(new Date(e.target.value))}
                  min={departureDate.toISOString().split('T')[0]}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          )}

          {/* Passengers */}
          <div className="relative" ref={popoverRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t('search.passengers')}
            </label>
            <div className="relative group">
              <UsersIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-500 transition-colors" />
              <button
                onClick={() => setIsPassengerPopoverOpen(!isPassengerPopoverOpen)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-left focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-gray-50 text-sm sm:text-base transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
              >
                {getPassengerText()}
              </button>
            </div>
            {isPassengerPopoverOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{t('search.adults')}</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        -
                      </button>
                      <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-semibold">{passengers.adults}</span>
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, adults: prev.adults + 1 }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{t('search.children')}</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        -
                      </button>
                      <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-semibold">{passengers.children}</span>
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, children: prev.children + 1 }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{t('search.infants')}</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        -
                      </button>
                      <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-semibold">{passengers.infants}</span>
                      <button
                        onClick={() => setPassengers(prev => ({ ...prev, infants: prev.infants + 1 }))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 text-sm sm:text-base transition-all duration-300 font-bold text-gray-600 hover:text-blue-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center pt-4 sm:pt-6">
          <button
            onClick={handleSearch}
            disabled={isLoading || !from || !to}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 sm:px-16 py-4 sm:py-5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>{t('search.search')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchForm;