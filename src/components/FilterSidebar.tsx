

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Advertisement, Flight } from '../types';
import { AdPlacement } from '../types';
import { AdBanner } from './AdBanner';

export interface Filters {
  stops: number[]; // 0 for direct, 1 for 1 stop, 2 for 2+
  maxPrice: number;
  airlines: string[];
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const CheckboxOption: React.FC<{ id: string; label: string; count: number; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ id, label, count, checked, onChange, disabled }) => (
  <label htmlFor={id} className={`flex items-center justify-between text-sm cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'}`}>
    <div className="flex items-center">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-accent ml-2" />
      <span className={`group-hover:text-primary transition-colors ${disabled ? 'group-hover:text-slate-600' : ''}`}>{label}</span>
    </div>
    <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">{count}</span>
  </label>
);

interface FilterSidebarProps {
  flights: Flight[];
  onFilterChange: (filters: Filters) => void;
  advertisements: Advertisement[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ flights, onFilterChange, advertisements }) => {
  const { t, formatNumber } = useLocalization();
  const sidebarAd = advertisements.find(ad => ad.isActive && ad.placement === AdPlacement.SIDEBAR_BOTTOM);

  const flightData = useMemo(() => {
    if (flights.length === 0) {
      return { minPrice: 0, maxPrice: 0, airlineCounts: {}, stopCounts: { 0: 0, 1: 0, 2: 0 } };
    }
    const prices = flights.map(f => f.price + f.taxes);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const airlineCounts: Record<string, number> = {};
    flights.forEach(f => {
        airlineCounts[f.airline] = (airlineCounts[f.airline] || 0) + 1;
    });
    
    const stopCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    flights.forEach(f => {
      if (f.stops === 0) stopCounts[0]++;
      else if (f.stops === 1) stopCounts[1]++;
      else stopCounts[2]++;
    });

    return { minPrice, maxPrice, airlineCounts, stopCounts };
  }, [flights]);

  const [filters, setFilters] = useState<Filters>({ stops: [], maxPrice: flightData.maxPrice, airlines: [] });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      maxPrice: flightData.maxPrice,
    }));
  }, [flightData.maxPrice]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const handleStopChange = (stop: number, checked: boolean) => {
    setFilters(prev => ({
        ...prev,
        stops: checked ? [...prev.stops, stop] : prev.stops.filter(s => s !== stop)
    }));
  };

  const handleAirlineChange = (airline: string, checked: boolean) => {
    setFilters(prev => ({
        ...prev,
        airlines: checked ? [...prev.airlines, airline] : prev.airlines.filter(a => a !== airline)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-slate-200/80">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-primary">{t('filters.title')}</h2>
      </div>
      
      <FilterSection title={t('filters.stops')}>
        <CheckboxOption id="stops-0" label={t('filters.direct')} count={flightData.stopCounts[0]} checked={filters.stops.includes(0)} onChange={c => handleStopChange(0, c)} disabled={flightData.stopCounts[0] === 0}/>
        <CheckboxOption id="stops-1" label={t('filters.oneStop')} count={flightData.stopCounts[1]} checked={filters.stops.includes(1)} onChange={c => handleStopChange(1, c)} disabled={flightData.stopCounts[1] === 0}/>
        <CheckboxOption id="stops-2" label={t('filters.twoPlusStops')} count={flightData.stopCounts[2]} checked={filters.stops.includes(2)} onChange={c => handleStopChange(2, c)} disabled={flightData.stopCounts[2] === 0}/>
      </FilterSection>

      <FilterSection title={t('priceSummary.title')}>
          <div className="space-y-3">
              <input 
                type="range"
                min={flightData.minPrice}
                max={flightData.maxPrice}
                value={filters.maxPrice}
                onChange={e => setFilters(prev => ({...prev, maxPrice: parseInt(e.target.value, 10)}))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                disabled={flights.length === 0}
              />
              <div className="flex justify-between text-xs text-slate-500">
                  <span>{formatNumber(flightData.minPrice)}</span>
                  <span>{formatNumber(filters.maxPrice)}</span>
              </div>
          </div>
      </FilterSection>

      <FilterSection title={t('filters.airline')}>
        {Object.entries(flightData.airlineCounts).map(([airline, count]) => (
            <CheckboxOption key={airline} id={`airline-${airline}`} label={airline} count={count} checked={filters.airlines.includes(airline)} onChange={c => handleAirlineChange(airline, c)} />
        ))}
      </FilterSection>

      {sidebarAd && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <AdBanner advertisement={sidebarAd} />
        </div>
      )}
    </div>
  );
};