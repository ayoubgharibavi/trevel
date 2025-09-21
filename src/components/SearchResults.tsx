import React, { useState } from 'react';
import type { Flight, RefundPolicy, Advertisement, User, CurrencyInfo, SearchQuery } from '@/types';
import { AdPlacement, TripType } from '@/types';
import { FlightCard } from '@/components/FlightCard';
import { SortDropdown, SortOption } from '@/components/SortDropdown';
import { useLocalization } from '@/hooks/useLocalization';
import { AdBanner } from '@/components/AdBanner';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { ArrowRightLeftIcon } from '@/components/icons/ArrowRightLeftIcon';

interface PopularRoutesProps {
    routes: { from: string, to: string }[];
    onSearch: (query: SearchQuery) => void;
}

const PopularRoutes: React.FC<PopularRoutesProps> = ({ routes, onSearch }) => {
    const { t } = useLocalization();


    const handleRouteClick = (from: string, to: string) => {
        const today = new Date().toISOString().split('T')[0];
        const query: SearchQuery = {
            tripType: TripType.OneWay,
            from,
            to,
            departureDate: today,
            passengers: { adults: 1, children: 0, infants: 0 },
        };
        onSearch(query);
    };

    return (
        <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">{t('popularRoutes.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {routes.map((route, index) => (
                    <button
                        key={index}
                        onClick={() => handleRouteClick(route.from, route.to)}
                        className="p-6 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-solid hover:border-accent hover:bg-blue-50/50 transition-all text-center group transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-center gap-2 text-slate-700 group-hover:text-primary transition-colors">
                            <PlaneTakeoffIcon className="w-6 h-6" />
                            <span className="font-bold text-xl">{route.from}</span>
                            <ArrowRightLeftIcon className="w-5 h-5 text-slate-400" />
                            <span className="font-bold text-xl">{route.to}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 group-hover:text-accent transition-colors font-semibold">{t('popularRoutes.searchNow')}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

interface SearchResultsProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  advertisements: Advertisement[];
  currentUser: User | null;
  currencies: CurrencyInfo[];
  popularRoutes: { from: string; to: string }[];
  onSearch: (query: SearchQuery) => void;
}

const durationToMinutes = (duration: string | number): number => {
    if (typeof duration === 'number') {
        return duration;
    }
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
};


export const SearchResults: React.FC<SearchResultsProps> = ({ flights, onSelectFlight, refundPolicies, advertisements, currentUser, currencies, popularRoutes, onSearch }) => {
  const [sortOption, setSortOption] = useState<SortOption>('best');
  const { t } = useLocalization();

  console.log('🔍 SearchResults component - flights prop:', flights);
  console.log('🔍 SearchResults component - flights length:', flights.length);
  console.log('🔍 SearchResults component - flights type:', typeof flights);
  console.log('🔍 SearchResults component - flights is array:', Array.isArray(flights));
  console.log('🔍 SearchResults component - flights data:', flights);
  console.log('🔍 SearchResults component - flights[0]:', flights[0]);

  const topAd = advertisements.find(ad => ad.isActive && ad.placement === AdPlacement.SEARCH_RESULTS_TOP);




  const sortedFlights = [...flights].sort((a, b) => {
    console.log('🔍 Sorting flights:', flights.length, 'flights');
    if (sortOption === 'price') {
      const aPrice = (typeof a.price === 'string' ? parseInt(a.price) : a.price) + (typeof a.taxes === 'string' ? parseInt(a.taxes) : a.taxes);
      const bPrice = (typeof b.price === 'string' ? parseInt(b.price) : b.price) + (typeof b.taxes === 'string' ? parseInt(b.taxes) : b.taxes);
      return aPrice - bPrice;
    }
    if (sortOption === 'duration') {
        return durationToMinutes(a.duration) - durationToMinutes(b.duration);
    }
     if (sortOption === 'best') {
        if (flights.length <= 1) return 0;

        const prices = flights.map(f => (typeof f.price === 'string' ? parseInt(f.price) : f.price) + (typeof f.taxes === 'string' ? parseInt(f.taxes) : f.taxes));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const durations = flights.map(f => durationToMinutes(f.duration));
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);

        const getScore = (flight: Flight) => {
            const flightPrice = (typeof flight.price === 'string' ? parseInt(flight.price) : flight.price) + (typeof flight.taxes === 'string' ? parseInt(flight.taxes) : flight.taxes);
            const priceScore = maxPrice === minPrice ? 0 : (flightPrice - minPrice) / (maxPrice - minPrice);
            const durationScore = maxDuration === minDuration ? 0 : (durationToMinutes(flight.duration) - minDuration) / (maxDuration - minDuration);
            // 60% weight for price, 40% for duration
            return 0.6 * priceScore + 0.4 * durationScore;
        };

        return getScore(a) - getScore(b);
    }
    return 0;
  });

  console.log('🔍 About to render sortedFlights:', sortedFlights.length, 'flights');
  console.log('🔍 About to render - flights.length:', flights.length);
  console.log('🔍 About to render - sortedFlights.length:', sortedFlights.length);
  console.log('🔍 About to render - sortedFlights data:', sortedFlights);

  // Show loading state
  console.log('🔍 Checking flights.length === 0:', flights.length === 0);
  console.log('🔍 flights.length:', flights.length);
  console.log('🔍 flights:', flights);
  console.log('🔍 flights.length === 0 result:', flights.length === 0);
  console.log('🔍 flights.length !== 0 result:', flights.length !== 0);
  console.log('🔍 flights.length > 0 result:', flights.length > 0);
  console.log('🔍 flights.length === 0 condition:', flights.length === 0);
  console.log('🔍 flights.length === 0 condition result:', flights.length === 0);
  if (flights.length === 0) {
    console.log('🔍 Rendering no flights UI - flights.length is 0');
    console.log('🔍 flights array:', flights);
    console.log('🔍 flights.length:', flights.length);
    console.log('🔍 flights === 0:', flights.length === 0);
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('searchResults.noFlights')}</h3>
            <p className="text-slate-600 mb-6">{t('searchResults.noFlightsDescription')}</p>
          </div>
          
          {/* Popular Routes */}
          <PopularRoutes routes={popularRoutes} onSearch={onSearch} />
        </div>
      </div>
    );
  }

  console.log('🔍 Rendering SearchResults with flights:', flights.length, 'flights');
  console.log('🔍 Rendering SearchResults with sortedFlights:', sortedFlights.length, 'flights');
  console.log('🔍 flights.length > 0:', flights.length > 0);
  console.log('🔍 flights.length !== 0:', flights.length !== 0);
  console.log('🔍 About to render flight cards - flights.length:', flights.length);
  console.log('🔍 About to render flight cards - sortedFlights.length:', sortedFlights.length);
  console.log('🔍 About to render flight cards - sortedFlights:', sortedFlights);
  console.log('🔍 About to render flight cards - flights.length > 0:', flights.length > 0);
  console.log('🔍 About to render flight cards - sortedFlights.length > 0:', sortedFlights.length > 0);
  console.log('🔍 About to render flight cards - flights.length === 0:', flights.length === 0);
  console.log('🔍 About to render flight cards - sortedFlights.length === 0:', sortedFlights.length === 0);
  console.log('🔍 About to render flight cards - flights.length !== 0:', flights.length !== 0);
  console.log('🔍 About to render flight cards - sortedFlights.length !== 0:', sortedFlights.length !== 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  {t('searchResults.title')}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-slate-600 font-medium">
                    {t('searchResults.resultsCount', { count: sortedFlights.length })}
                  </p>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="w-full sm:w-auto">
                <SortDropdown value={sortOption} onChange={setSortOption} />
              </div>
            </div>
          </div>

          {/* Top Advertisement */}
          {topAd && (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <AdBanner 
                advertisement={topAd} 
                currentUser={currentUser}
                onAdClick={() => {
                  // Handle ad click
                  console.log('Ad clicked:', topAd.id);
                }}
              />
            </div>
          )}

          {/* Flight Results */}
          <div className="space-y-6">
            {console.log('🔍 Rendering flight cards for:', sortedFlights.length, 'flights')}
            {console.log('🔍 sortedFlights array:', sortedFlights)}
            {console.log('🔍 sortedFlights.length > 0:', sortedFlights.length > 0)}
            {console.log('🔍 sortedFlights.length === 0:', sortedFlights.length === 0)}
            {console.log('🔍 sortedFlights.length !== 0:', sortedFlights.length !== 0)}
            {console.log('🔍 sortedFlights.length > 0 result:', sortedFlights.length > 0)}
            {console.log('🔍 sortedFlights.length === 0 result:', sortedFlights.length === 0)}
            {console.log('🔍 sortedFlights.length !== 0 result:', sortedFlights.length !== 0)}
            {console.log('🔍 sortedFlights.length > 0 condition:', sortedFlights.length > 0)}
            {console.log('🔍 sortedFlights.length === 0 condition:', sortedFlights.length === 0)}
            {console.log('🔍 sortedFlights.length !== 0 condition:', sortedFlights.length !== 0)}
            {sortedFlights.map((flight, index) => {
              console.log('🔍 Rendering flight card:', index, flight.id, flight.flightNumber);
              console.log('🔍 Flight object:', flight);
              return (
                <div 
                  key={flight.id} 
                  className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FlightCard 
                    flight={flight} 
                    onSelect={onSelectFlight} 
                    refundPolicies={refundPolicies} 
                    currentUser={currentUser} 
                    currencies={currencies} 
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};