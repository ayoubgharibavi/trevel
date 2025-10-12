import React, { useState, useMemo } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Flight, RefundPolicy, User, Currency, Advertisement } from '@/types';
import { PersianFlightCard } from './PersianFlightCard';
import { PersianResultsHeader } from './PersianResultsHeader';
import { PersianFilterSidebar } from './PersianFilterSidebar';
import { SortTabs } from './SortTabs';

interface PersianFlightResultsProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  currentUser: User | null;
  currencies: Currency[];
  advertisements: Advertisement[];
  onSearch: (searchData: any) => void;
  popularRoutes?: any[];
  searchQuery?: any;
}

export const PersianFlightResults: React.FC<PersianFlightResultsProps> = ({
  flights,
  onSelectFlight,
  refundPolicies,
  currentUser,
  currencies,
  advertisements,
  onSearch,
  popularRoutes = [],
  searchQuery
}) => {
  const { t, language } = useLocalization();
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 100000000 },
    airlines: [] as string[],
    departureTime: [] as string[],
    flightClass: [] as string[],
    stops: [] as string[]
  });

  // Filter and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    console.log('🔍 PersianFlightResults - Total flights received:', flights.length);
    console.log('🔍 PersianFlightResults - Price filter range:', filters.priceRange);
    console.log('🔍 PersianFlightResults - Sample flight prices:', flights.slice(0, 3).map(f => ({ id: f.id, price: f.price })));
    
    let filtered = flights.filter(flight => {
      // Price filter
      if (flight.price < filters.priceRange.min || flight.price > filters.priceRange.max) {
        return false;
      }

      // Airline filter
      const airlineName = flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || flight.airline || '';
      if (filters.airlines.length > 0 && !filters.airlines.includes(airlineName)) {
        return false;
      }

      // Departure time filter
      if (filters.departureTime.length > 0) {
        const departureTime = flight.departure?.dateTime || flight.departureTime;
        if (departureTime) {
          const departureHour = new Date(departureTime).getHours();
          const timeCategory = departureHour < 6 ? 'night' : 
                             departureHour < 12 ? 'morning' : 
                             departureHour < 18 ? 'afternoon' : 'evening';
          if (!filters.departureTime.includes(timeCategory)) {
            return false;
          }
        }
      }

      // Flight class filter
      const flightClassName = flight.flightClass?.name?.fa || flight.flightClass?.name?.en || flight.flightClass?.name || flight.flightClass || '';
      if (filters.flightClass.length > 0 && !filters.flightClass.includes(flightClassName)) {
        return false;
      }

      // Stops filter
      if (filters.stops.length > 0) {
        const stops = flight.stops || 0;
        const stopCategory = stops === 0 ? 'direct' : stops === 1 ? 'one-stop' : 'multi-stop';
        if (!filters.stops.includes(stopCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sort flights
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'duration':
          const durationA = typeof a.duration === 'number' ? a.duration : 0;
          const durationB = typeof b.duration === 'number' ? b.duration : 0;
          comparison = durationA - durationB;
          break;
        case 'departure':
          const aDepartureTime = a.departure?.dateTime || a.departureTime;
          const bDepartureTime = b.departure?.dateTime || b.departureTime;
          comparison = new Date(aDepartureTime).getTime() - new Date(bDepartureTime).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log('🔍 PersianFlightResults - Filtered flights count:', filtered.length);
    console.log('🔍 PersianFlightResults - Filtered flights IDs:', filtered.map(f => f.id));
    
    return filtered;
  }, [flights, filters, sortBy, sortOrder]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSortBy: 'price' | 'duration' | 'departure', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PersianResultsHeader 
        searchQuery={searchQuery}
        flights={flights}
        filteredFlights={filteredAndSortedFlights}
        onSearch={onSearch}
      />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-3 sm:mb-4 bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors touch-manipulation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {language === 'fa' ? 'فیلترها' : 'Filters'}
          {showFilters ? 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg> : 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          }
        </button>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <PersianFilterSidebar
              flights={flights}
              onFilterChange={handleFilterChange}
              resultCount={filteredAndSortedFlights.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sort Tabs */}
            <SortTabs
              activeSort={(() => {
                const activeSort = sortBy === 'price' && sortOrder === 'asc' ? 'cheapest' :
                  sortBy === 'duration' && sortOrder === 'asc' ? 'fastest' :
                  sortBy === 'departure' && sortOrder === 'asc' ? 'sort' :
                  sortBy === 'price' && sortOrder === 'desc' ? 'other' :
                  'cheapest'; // default
                console.log('🎯 Active sort:', activeSort, 'sortBy:', sortBy, 'sortOrder:', sortOrder);
                return activeSort;
              })()}
              onSortChange={(sortId: string) => {
                console.log('🔄 SortTabs received:', sortId);
                if (sortId === 'cheapest') {
                  handleSortChange('price', 'asc');
                } else if (sortId === 'fastest') {
                  handleSortChange('duration', 'asc');
                } else if (sortId === 'sort') {
                  handleSortChange('departure', 'asc');
                } else if (sortId === 'other') {
                  handleSortChange('price', 'desc');
                }
              }}
            />

            {/* Flight Cards */}
            <div className="space-y-3 sm:space-y-4">
              {filteredAndSortedFlights.length > 0 ? (
                filteredAndSortedFlights.map((flight, index) => {
                  // Find the cheapest flight to mark as special offer
                  const cheapestFlight = filteredAndSortedFlights.reduce((cheapest, current) => 
                    current.price < cheapest.price ? current : cheapest
                  );
                  const isSpecialOffer = flight.id === cheapestFlight.id; // Mark cheapest as special offer
                  
                  return (
                    <PersianFlightCard
                      key={`${flight.id}-${index}`}
                      flight={flight}
                      onSelect={onSelectFlight}
                      refundPolicies={refundPolicies}
                      currentUser={currentUser}
                      currencies={currencies}
                      showCommission={currentUser?.role === 'ADMIN'}
                      isSpecialOffer={isSpecialOffer} // Only cheapest flight is special offer
                    />
                  );
                })
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-500 text-base sm:text-lg mb-4">
                    {t('searchResults.noFlightsFound')}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
                  >
                    {t('searchResults.searchAgain')}
                  </button>
                </div>
              )}
            </div>

            {/* Advertisements */}
            {advertisements.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  {t('searchResults.advertisements')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {advertisements.slice(0, 2).map(ad => (
                    <div key={ad.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                        {ad.title[language]}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {ad.description[language]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};