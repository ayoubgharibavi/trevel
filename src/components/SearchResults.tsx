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

const durationToMinutes = (duration: string): number => {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
};


export const SearchResults: React.FC<SearchResultsProps> = ({ flights, onSelectFlight, refundPolicies, advertisements, currentUser, currencies, popularRoutes, onSearch }) => {
  const [sortOption, setSortOption] = useState<SortOption>('best');
  const { t } = useLocalization();

  const topAd = advertisements.find(ad => ad.isActive && ad.placement === AdPlacement.SEARCH_RESULTS_TOP);

  if (flights.length === 0) {
    return <PopularRoutes routes={popularRoutes} onSearch={onSearch} />;
  }

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortOption === 'price') {
      return (a.price + a.taxes) - (b.price + b.taxes);
    }
    if (sortOption === 'duration') {
        return durationToMinutes(a.duration) - durationToMinutes(b.duration);
    }
     if (sortOption === 'best') {
        if (flights.length <= 1) return 0;

        const prices = flights.map(f => f.price + f.taxes);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const durations = flights.map(f => durationToMinutes(f.duration));
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);

        const getScore = (flight: Flight) => {
            const priceScore = maxPrice === minPrice ? 0 : ((flight.price + flight.taxes) - minPrice) / (maxPrice - minPrice);
            const durationScore = maxDuration === minDuration ? 0 : (durationToMinutes(flight.duration) - minDuration) / (maxDuration - minDuration);
            // 60% weight for price, 40% for duration
            return 0.6 * priceScore + 0.4 * durationScore;
        };

        return getScore(a) - getScore(b);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {topAd && <AdBanner advertisement={topAd} />}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            {t('searchResults.title')}
            <span className="text-sm font-normal text-slate-500 mr-2">{t('searchResults.found', sortedFlights.length)}</span>
          </h2>
          <SortDropdown selected={sortOption} onSelect={setSortOption} />
        </div>
        <div className="space-y-4">
          {sortedFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onSelect={onSelectFlight} refundPolicies={refundPolicies} currentUser={currentUser} currencies={currencies} />
          ))}
        </div>
      </div>
    </div>
  );
};