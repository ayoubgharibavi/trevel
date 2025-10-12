import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { Flight } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface FilterState {
  stops: string[];
  airlines: string[];
  ticketType: string[];
  aircraft: string[];
  airports: string[];
  priceRange: [number, number];
  departureTimeRange: [number, number];
  arrivalTimeRange: [number, number];
  travelDurationRange: [number, number];
  stopoverDurationRange: [number, number];
  specialOffer: boolean;
  showDuplicates: boolean;
}

interface PersianFilterSidebarProps {
  flights: Flight[];
  onFilterChange: (filters: FilterState) => void;
  resultCount: number;
}

export const PersianFilterSidebar: React.FC<PersianFilterSidebarProps> = ({
  flights,
  onFilterChange,
  resultCount
}) => {
  const { language, t, formatNumber } = useLocalization();
  const [filters, setFilters] = useState<FilterState>({
    stops: [],
    airlines: [],
    ticketType: [],
    aircraft: [],
    airports: [],
    priceRange: [0, 999999999], // Very wide range to not filter anything by default
    departureTimeRange: [0, 23],
    arrivalTimeRange: [0, 23],
    travelDurationRange: [0, 999], // Very wide range to not filter anything by default
    stopoverDurationRange: [0, 24],
    specialOffer: false,
    showDuplicates: false
  });

  const [airlineSearch, setAirlineSearch] = useState('');
  const [airportSearch, setAirportSearch] = useState('');
  const [aircraftSearch, setAircraftSearch] = useState('');

  // Calculate filter data from flights
  const filterData = useMemo(() => {
    if (flights.length === 0) {
      return {
        airlines: [],
        stops: [],
        aircraft: [],
        airports: [],
        ticketTypes: [],
        minPrice: 0,
        maxPrice: 0,
        minDuration: 0,
        maxDuration: 0,
        totalFlights: 0
      };
    }

    const airlines = Array.from(new Set(flights.map(f => 
      typeof f.airline === 'string' ? f.airline : f.airline?.name || 'نامشخص'
    )));
    
    const stops = Array.from(new Set(flights.map(f => f.stops.toString())));
    
    const aircraft = Array.from(new Set(flights.map(f => f.aircraft || 'نامشخص')));
    
    const airports = Array.from(new Set([
      ...flights.map(f => f.departure?.airportCode || 'نامشخص'),
      ...flights.map(f => f.arrival?.airportCode || 'نامشخص')
    ])).filter(airport => airport !== 'نامشخص');
    
    const ticketTypes = Array.from(new Set(flights.map(f => 
      f.sourcingType === 'Charter' ? 'چارتری' : 'سیستمی'
    )));
    
    const prices = flights.map(f => {
      const price = Number(f.price) || 0;
      const taxes = Number(f.taxes) || 0;
      return price + taxes;
    }).filter(p => !isNaN(p) && p > 0);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000000;
    
    const durations = flights.map(f => Number(f.duration) || 0).filter(d => !isNaN(d) && d > 0);
    const minDuration = durations.length > 0 ? Math.min(...durations) : 1;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 24;

    return {
      airlines,
      stops,
      aircraft,
      airports,
      ticketTypes,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      totalFlights: flights.length
    };
  }, [flights]);

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleCheckboxChange = (filterType: keyof FilterState, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    updateFilters({ [filterType]: newValues });
  };

  const handleRangeChange = (filterType: keyof FilterState, value: number, index: 0 | 1) => {
    const currentRange = filters[filterType] as [number, number];
    const newRange = [...currentRange] as [number, number];
    newRange[index] = value;
    updateFilters({ [filterType]: newRange });
  };

  const handleBooleanChange = (filterType: keyof FilterState, value: boolean) => {
    updateFilters({ [filterType]: value });
  };

  // Filter airlines based on search
  const filteredAirlines = useMemo(() => {
    return filterData.airlines.filter(airline =>
      airline.toLowerCase().includes(airlineSearch.toLowerCase())
    );
  }, [filterData.airlines, airlineSearch]);

  return (
    <div className="w-full" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
        <div className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 font-medium">
          {language === 'en' ? `Results: ${resultCount}` : `نتایج : ${resultCount}`}
        </div>

        {/* Airlines Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Airlines' : 'شرکت‌های هواپیمایی'}</h4>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={language === 'en' ? 'Airline name' : 'نام شرکت هواپیمایی'}
              value={airlineSearch}
              onChange={(e) => setAirlineSearch(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {filteredAirlines.map((airline) => (
              <label key={airline} className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 touch-manipulation">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(airline)}
                    onChange={() => handleCheckboxChange('airlines', airline)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-3 sm:h-3"
                  />
                  <span className="text-sm sm:text-sm text-gray-600">{airline}</span>
                </div>
                <span className="text-xs sm:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {flights.filter(f => 
                    (typeof f.airline === 'string' ? f.airline : f.airline?.name || 'نامشخص') === airline
                  ).length}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Stops Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Stops' : 'توقف‌ها'}</h4>
          <div className="space-y-2">
            {filterData.stops.map(stopCount => {
              const count = parseInt(stopCount);
              const label = count === 0 ? (language === 'en' ? 'Direct flight' : 'پرواز مستقیم') : 
                           count === 1 ? (language === 'en' ? '1 stop' : 'یک توقف') : 
                           (language === 'en' ? `${count} stops` : `${count} توقف`);
              const flightCount = flights.filter(f => f.stops === count).length;
              
              return (
                <label key={stopCount} className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 touch-manipulation">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.stops.includes(stopCount)}
                      onChange={() => handleCheckboxChange('stops', stopCount)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-3 sm:h-3"
                    />
                    <span className="text-sm sm:text-sm text-gray-600">{label}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{flightCount}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Price' : 'قیمت'}</h4>
          <div className="space-y-3">
            <div className="w-full h-3 bg-gray-200 rounded-lg relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg"></div>
              <input
                type="range"
                min={filterData.minPrice}
                max={filterData.maxPrice}
                value={filters.priceRange[1]}
                onChange={(e) => handleRangeChange('priceRange', parseInt(e.target.value), 1)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-manipulation"
              />
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-500">
              <span>{(filterData.minPrice / 1000000).toFixed(1)} میلیون تومان</span>
              <span>{(filterData.maxPrice / 1000000).toFixed(1)} میلیون تومان</span>
            </div>
          </div>
        </div>

        {/* Travel Duration Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Travel Duration' : 'مدت زمان سفر'}</h4>
          <div className="space-y-2">
            <div className="w-full h-2 bg-gray-200 rounded-lg relative">
              <input
                type="range"
                min={filterData.minDuration}
                max={filterData.maxDuration}
                value={filters.travelDurationRange[1]}
                onChange={(e) => handleRangeChange('travelDurationRange', parseInt(e.target.value), 1)}
                className="w-full h-full bg-transparent cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
              <span>{filterData.minDuration} ساعت</span>
              <span>{filterData.maxDuration} ساعت</span>
            </div>
          </div>
        </div>

        {/* Stopover Duration Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Stopover Duration' : 'مدت زمان توقف‌ها'}</h4>
          <div className="space-y-2">
            <div className="w-full h-2 bg-gray-200 rounded-lg relative">
              <input
                type="range"
                min="0"
                max="21"
                value={filters.stopoverDurationRange[1]}
                onChange={(e) => handleRangeChange('stopoverDurationRange', parseInt(e.target.value), 1)}
                className="w-full h-full bg-transparent cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
              <span>۰ ساعت</span>
              <span>۲۱ ساعت</span>
            </div>
          </div>
        </div>

        {/* Special Offer */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Special Offer' : 'پیشنهاد ویژه'}</h4>
          <label className="flex items-center py-2 px-1 rounded-lg hover:bg-gray-50 touch-manipulation">
            <input
              type="checkbox"
              checked={filters.specialOffer}
              onChange={(e) => handleBooleanChange('specialOffer', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-3 sm:h-3"
            />
            <span className="mr-3 text-sm sm:text-sm text-gray-600">ارتقا امکانات</span>
          </label>
        </div>

        {/* Airports Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Airports' : 'فرودگاه‌ها'}</h4>
          
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={language === 'en' ? 'Search airport' : 'جستجوی فرودگاه'}
              value={airportSearch}
              onChange={(e) => setAirportSearch(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {filterData.airports
              .filter(airport => 
                airport.toLowerCase().includes(airportSearch.toLowerCase())
              )
              .map((airport) => {
                const flightCount = flights.filter(f => 
                  f.departure?.airportCode === airport || f.arrival?.airportCode === airport
                ).length;
                
                return (
                  <label key={airport} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.airports.includes(airport)}
                        onChange={() => handleCheckboxChange('airports', airport)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-xs sm:text-sm text-gray-600">{airport}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500">{flightCount}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Aircraft Model Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Aircraft Model' : 'مدل هواپیما'}</h4>
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={language === 'en' ? 'Search aircraft model' : 'جستجوی مدل هواپیما'}
              value={aircraftSearch}
              onChange={(e) => setAircraftSearch(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-1.5 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
            {filterData.aircraft
              .filter(model => 
                model.toLowerCase().includes(aircraftSearch.toLowerCase())
              )
              .map((model) => {
                const flightCount = flights.filter(f => f.aircraft === model).length;
                
                return (
                  <label key={model} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.aircraft.includes(model)}
                        onChange={() => handleCheckboxChange('aircraft', model)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-xs sm:text-sm text-gray-600">{model}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500">{flightCount}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Ticket Type Filter */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{language === 'en' ? 'Ticket Type' : 'نوع بلیط'}</h4>
          <div className="space-y-1.5 sm:space-y-2">
            {filterData.ticketTypes.map(ticketType => {
              const flightCount = flights.filter(f => 
                (f.sourcingType === 'Charter' && ticketType === (language === 'en' ? 'Charter' : 'چارتری')) ||
                (f.sourcingType !== 'Charter' && ticketType === (language === 'en' ? 'System' : 'سیستمی'))
              ).length;
              
              return (
                <label key={ticketType} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.ticketType.includes(ticketType)}
                      onChange={() => handleCheckboxChange('ticketType', ticketType)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-xs sm:text-sm text-gray-600">{ticketType}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">{flightCount}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Other Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{language === 'en' ? 'Others' : 'سایر'}</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showDuplicates}
              onChange={(e) => handleBooleanChange('showDuplicates', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-600">{language === 'en' ? 'Show duplicate tickets' : 'نمایش بلیط‌های تکراری'}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
