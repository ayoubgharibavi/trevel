

import React, { useState } from 'react';
import type { Flight, RefundPolicy, Advertisement, User, CurrencyInfo } from '../types';
import { AdPlacement } from '../types';
import { FlightCard } from './FlightCard';
import { SortDropdown, SortOption } from './SortDropdown';
import { useLocalization } from '../hooks/useLocalization';
import { AdBanner } from './AdBanner';

interface SearchResultsProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  advertisements: Advertisement[];
  currentUser: User | null;
  currencies: CurrencyInfo[];
}

const durationToMinutes = (duration: string): number => {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
};


export const SearchResults: React.FC<SearchResultsProps> = ({ flights, onSelectFlight, refundPolicies, advertisements, currentUser, currencies }) => {
  const [sortOption, setSortOption] = useState<SortOption>('best');
  const { t } = useLocalization();

  const topAd = advertisements.find(ad => ad.isActive && ad.placement === AdPlacement.SEARCH_RESULTS_TOP);

  if (flights.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">{t('searchResults.notFoundTitle')}</h2>
        <p className="text-slate-500">{t('searchResults.notFoundSubtitle')}</p>
      </div>
    );
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