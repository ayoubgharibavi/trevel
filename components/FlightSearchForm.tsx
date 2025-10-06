import React, { useState, useRef, useEffect } from 'react';
import { TripType } from '@/types';
import type { SearchQuery, Passengers, AirportInfo } from '@/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from '@/components/icons/PlaneLandingIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ArrowRightLeftIcon } from '@/components/icons/ArrowRightLeftIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import PriceCalendar from '@/components/PriceCalendar';
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
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [passengers, setPassengers] = useState<Passengers>({ adults: 1, children: 0, infants: 0 });
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const passengerSelectorRef = useRef<HTMLDivElement>(null);
  const priceCalendarRef = useRef<HTMLDivElement>(null);

  // Utility function to safely get airport name
  const getAirportName = (airport: AirportInfo): string => {
    if (typeof airport.name === 'string') {
      return airport.name;
    }
    return airport.name?.fa || airport.name?.en || '';
  };

  // Utility function to safely get airport city
  const getAirportCity = (airport: AirportInfo): string => {
    if (typeof airport.city === 'string') {
      return airport.city;
    }
    return airport.city?.fa || airport.city?.en || '';
  };

  // Utility function to safely get airport code
  const getAirportCode = (airport: AirportInfo): string => {
    return airport.iata || '';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerSelectorRef.current && !passengerSelectorRef.current.contains(event.target as Node)) {
        setShowPassengerSelector(false);
      }
      if (priceCalendarRef.current && !priceCalendarRef.current.contains(event.target as Node)) {
        setShowPriceCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredAirports = airports.filter(airport => {
    const name = getAirportName(airport);
    const city = getAirportCity(airport);
    const code = getAirportCode(airport);
    
    return name.toLowerCase().includes(fromFilter.toLowerCase()) ||
           code.toLowerCase().includes(fromFilter.toLowerCase()) ||
           city.toLowerCase().includes(fromFilter.toLowerCase());
  });

  const filteredToAirports = airports.filter(airport => {
    const name = getAirportName(airport);
    const city = getAirportCity(airport);
    const code = getAirportCode(airport);
    
    return name.toLowerCase().includes(toFilter.toLowerCase()) ||
           code.toLowerCase().includes(toFilter.toLowerCase()) ||
           city.toLowerCase().includes(toFilter.toLowerCase());
  });

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const updatePassengers = (type: keyof Passengers, delta: number) => {
    const newPassengers = { ...passengers };
    newPassengers[type] = Math.max(0, newPassengers[type] + delta);
    
    if (type === 'infants' && newPassengers.infants > newPassengers.adults) {
      newPassengers.infants = newPassengers.adults;
    }
    
    setPassengers(newPassengers);
  };

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !departureDate) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const query: SearchQuery = {
      tripType,
      from,
      to,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === TripType.RoundTrip ? returnDate?.toISOString().split('T')[0] : undefined,
      passengers
    };

    onSearch(query);
  };

  const handleSepehrSearch = () => {
    if (!from || !to || !departureDate) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const query: SearchQuery = {
      tripType,
      from,
      to,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === TripType.RoundTrip ? returnDate?.toISOString().split('T')[0] : undefined,
      passengers
    };

    onSepehrSearch?.(query);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Type */}
        <div className="flex space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={() => setTripType(TripType.OneWay)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tripType === TripType.OneWay 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            یک طرفه
          </button>
          <button
            type="button"
            onClick={() => setTripType(TripType.RoundTrip)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tripType === TripType.RoundTrip 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            رفت و برگشت
          </button>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* From */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">مبدا</label>
            <div className="relative">
              <PlaneTakeoffIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setFromFilter(e.target.value);
                  setShowFromDropdown(true);
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="شهر یا فرودگاه مبدا"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {showFromDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredAirports.length > 0 ? (
                  <div className="py-2">
                    {filteredAirports.map((airport) => (
                      <button
                        key={airport.id}
                        type="button"
                        onClick={() => {
                          const name = getAirportName(airport);
                          const code = getAirportCode(airport);
                          setFrom(`${name} (${code})`);
                          setFromFilter('');
                          setShowFromDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-medium text-gray-900">
                              {getAirportName(airport)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getAirportCity(airport)}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-blue-600 text-lg">{getAirportCode(airport)}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    فرودگاهی یافت نشد
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={swapCities}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowRightLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* To */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">مقصد</label>
            <div className="relative">
              <PlaneLandingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setToFilter(e.target.value);
                  setShowToDropdown(true);
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="شهر یا فرودگاه مقصد"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {showToDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredToAirports.length > 0 ? (
                  <div className="py-2">
                    {filteredToAirports.map((airport) => (
                      <button
                        key={airport.id}
                        type="button"
                        onClick={() => {
                          const name = getAirportName(airport);
                          const code = getAirportCode(airport);
                          setTo(`${name} (${code})`);
                          setToFilter('');
                          setShowToDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-medium text-gray-900">
                              {getAirportName(airport)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getAirportCity(airport)}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-blue-600 text-lg">{getAirportCode(airport)}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    فرودگاهی یافت نشد
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="relative" ref={passengerSelectorRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">مسافران</label>
            <div className="relative">
              <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassengerSelector(!showPassengerSelector)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-right hover:border-gray-400 transition-colors"
              >
                {totalPassengers} مسافر
              </button>
            </div>
            
            {showPassengerSelector && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-4 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">بزرگسال</div>
                      <div className="text-sm text-gray-500">۱۲ سال و بالاتر</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => updatePassengers('adults', -1)}
                        disabled={passengers.adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">−</span>
                      </button>
                      <span className="w-8 text-center font-medium">{passengers.adults}</span>
                      <button
                        type="button"
                        onClick={() => updatePassengers('adults', 1)}
                        disabled={totalPassengers >= 9}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">کودک</div>
                      <div className="text-sm text-gray-500">۲ تا ۱۱ سال</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => updatePassengers('children', -1)}
                        disabled={passengers.children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">−</span>
                      </button>
                      <span className="w-8 text-center font-medium">{passengers.children}</span>
                      <button
                        type="button"
                        onClick={() => updatePassengers('children', 1)}
                        disabled={totalPassengers >= 9}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">نوزاد</div>
                      <div className="text-sm text-gray-500">زیر ۲ سال</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => updatePassengers('infants', -1)}
                        disabled={passengers.infants <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">−</span>
                      </button>
                      <span className="w-8 text-center font-medium">{passengers.infants}</span>
                      <button
                        type="button"
                        onClick={() => updatePassengers('infants', 1)}
                        disabled={passengers.infants >= passengers.adults || totalPassengers >= 9}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPassengerSelector(false)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      تایید
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departure Date */}
          <div className="relative" ref={priceCalendarRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ رفت</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-right hover:border-gray-400 transition-colors"
              >
                {departureDate.toLocaleDateString('fa-IR')}
              </button>
            </div>
            
            {showPriceCalendar && (
              <div className="absolute z-50 w-full mt-1">
                <PriceCalendar
                  selectedDate={departureDate}
                  onDateSelect={(date) => {
                    setDepartureDate(date);
                    setShowPriceCalendar(false);
                  }}
                  from={from}
                  to={to}
                />
              </div>
            )}
          </div>

          {/* Return Date */}
          {tripType === TripType.RoundTrip && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ برگشت</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={returnDate ? returnDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setReturnDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Search Buttons */}
        <div className="flex space-x-4 space-x-reverse">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>در حال جستجو...</span>
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                <span>جستجوی پرواز</span>
              </>
            )}
          </button>
          
          {onSepehrSearch && (
            <button
              type="button"
              onClick={handleSepehrSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              جستجوی سپهر
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export { FlightSearchForm };