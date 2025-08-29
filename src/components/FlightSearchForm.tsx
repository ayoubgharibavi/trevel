import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TripType } from '@/types';
import type { SearchQuery, Passengers, AirportInfo } from '@/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from '@/components/icons/PlaneLandingIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ArrowRightLeftIcon } from '@/components/icons/ArrowRightLeftIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface FlightSearchFormProps {
  onSearch: (query: SearchQuery) => void;
  isLoading: boolean;
  airports: AirportInfo[];
}

const PassengerCounter: React.FC<{
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    isIncrementDisabled?: boolean;
    isDecrementDisabled?: boolean;
}> = ({ label, value, onIncrement, onDecrement, isIncrementDisabled = false, isDecrementDisabled = false }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-slate-700">{label}</span>
        <div className="flex items-center space-x-2 space-x-reverse">
            <button type="button" onClick={onDecrement} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50" disabled={isDecrementDisabled}>-</button>
            <span className="w-8 text-center font-medium">{value}</span>
            <button type="button" onClick={onIncrement} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50" disabled={isIncrementDisabled}>+</button>
        </div>
    </div>
);


export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch, isLoading, airports }) => {
  const { t, language } = useLocalization();
  const [tripType, setTripType] = useState<TripType>(TripType.RoundTrip);
  
  const tehran = useMemo(() => airports.find(a => a.iata === 'IKA')?.city[language] || (language === 'ar' ? 'طهران' : 'تهران'), [airports, language]);
  const istanbul = useMemo(() => airports.find(a => a.iata === 'IST')?.city[language] || (language === 'ar' ? 'إسطنبول' : 'استانبول'), [airports, language]);

  const today = new Date().toISOString().split('T')[0];

  const [from, setFrom] = useState<string>(tehran);
  const [to, setTo] = useState<string>(istanbul);
  const [departureDate, setDepartureDate] = useState<string>(today);
  const [returnDate, setReturnDate] = useState<string>(() => {
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    return weekLater.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState<Passengers>({ adults: 1, children: 0, infants: 0 });
  const [isPassengerPopoverOpen, setIsPassengerPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const uniqueCities = useMemo(() => {
    const cities = airports.map(a => a.city[language]);
    return [...new Set(cities)];
  }, [airports, language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPassengerPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (tripType === TripType.RoundTrip && new Date(returnDate) < new Date(departureDate)) {
      setReturnDate(departureDate);
    }
  }, [departureDate, returnDate, tripType]);

  useEffect(() => {
    // Translates the current `from` and `to` city names when the language changes.
    const findAirportByAnyCityName = (cityName: string): AirportInfo | undefined => {
        return airports.find(airport => 
            Object.values(airport.city).some(name => name.toLowerCase() === cityName.toLowerCase())
        );
    };

    const fromAirport = findAirportByAnyCityName(from);
    const newFrom = fromAirport ? fromAirport.city[language] : tehran;
    if (newFrom !== from) {
      setFrom(newFrom);
    }
    
    const toAirport = findAirportByAnyCityName(to);
    const newTo = toAirport ? toAirport.city[language] : istanbul;
    if (newTo !== to) {
      setTo(newTo);
    }
  }, [language, airports, from, to, tehran, istanbul]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query: SearchQuery = {
      tripType,
      from,
      to,
      departureDate,
      passengers,
      ...(tripType === TripType.RoundTrip && { returnDate }),
    };
    onSearch(query);
  };
  
  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const handlePassengersChange = (type: keyof Passengers, operation: 'increment' | 'decrement') => {
      setPassengers(currentPassengers => {
          const newPassengers = { ...currentPassengers };
          const currentTotal = newPassengers.adults + newPassengers.children + newPassengers.infants;

          if (operation === 'increment') {
              if (currentTotal >= 9) {
                  return currentPassengers; // Max 9 passengers total
              }
              if (type === 'infants' && newPassengers.infants >= newPassengers.adults) {
                  return currentPassengers; // Infants cannot exceed adults
              }
              newPassengers[type]++;
          } else { // decrement
              if (type === 'adults') {
                  if (newPassengers.adults > 1) {
                      newPassengers.adults--;
                      // If new adult count is less than infant count, reduce infants too.
                      if (newPassengers.adults < newPassengers.infants) {
                          newPassengers.infants = newPassengers.adults;
                      }
                  }
              } else { // children or infants
                  if (newPassengers[type] > 0) {
                      newPassengers[type]--;
                  }
              }
          }
          return newPassengers;
      });
  };

  const isIncrementDisabled = totalPassengers >= 9;

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20">
       <div className="mb-6 max-w-xs mx-auto sm:mx-0">
        <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full flex items-center">
            <button
              type="button"
              onClick={() => setTripType(TripType.RoundTrip)}
              className={`w-full px-4 py-2 rounded-full text-sm font-bold transition-colors ${tripType === TripType.RoundTrip ? 'bg-white shadow text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {t('flightSearch.tripType.roundTrip')}
            </button>
            <button
              type="button"
              onClick={() => setTripType(TripType.OneWay)}
              className={`w-full px-4 py-2 rounded-full text-sm font-bold transition-colors ${tripType === TripType.OneWay ? 'bg-white shadow text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {t('flightSearch.tripType.oneWay')}
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-end lg:space-y-0">
        
        {/* Origin & Destination */}
        <div className="relative lg:col-span-5 flex flex-col sm:flex-row sm:items-stretch border border-slate-300 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600">
          <div className="relative w-full sm:flex-1">
            <label htmlFor="from" className="absolute -top-2.5 rtl:right-3 ltr:left-3 text-xs text-slate-500 bg-white dark:bg-slate-700 px-1">{t('flightSearch.from')}</label>
            <div className="flex items-center h-full">
              <PlaneTakeoffIcon className="absolute rtl:right-3 ltr:left-3 w-5 h-5 text-slate-400 pointer-events-none" />
              <input type="text" id="from" value={from} onChange={(e) => setFrom(e.target.value)} list="cities" className="w-full h-full rtl:pr-10 ltr:pl-10 py-4 border-0 rounded-t-lg sm:rounded-none sm:rtl:rounded-r-lg sm:ltr:rounded-l-lg focus:ring-0 text-slate-900 dark:bg-slate-700 dark:text-white text-lg bg-transparent" />
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-r sm:rtl:border-l sm:rtl:border-r-0 sm:border-l-slate-300 sm:border-r-slate-300 dark:border-slate-600 flex items-center justify-center relative my-2 sm:my-0">
              <button type="button" onClick={handleSwap} className="p-2 rounded-full border bg-white hover:bg-slate-100 transition z-10 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600" title={t('flightSearch.swap')}>
                <ArrowRightLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="relative w-full sm:flex-1">
            <label htmlFor="to" className="absolute -top-2.5 rtl:right-3 ltr:left-3 text-xs text-slate-500 bg-white dark:bg-slate-700 px-1">{t('flightSearch.to')}</label>
            <div className="flex items-center h-full">
              <PlaneLandingIcon className="absolute rtl:right-3 ltr:left-3 w-5 h-5 text-slate-400 pointer-events-none" />
              <input type="text" id="to" value={to} onChange={(e) => setTo(e.target.value)} list="cities" className="w-full h-full rtl:pr-10 ltr:pl-10 py-4 border-0 rounded-b-lg sm:rounded-none sm:rtl:rounded-l-lg sm:ltr:rounded-r-lg focus:ring-0 text-slate-900 dark:bg-slate-700 dark:text-white text-lg bg-transparent" />
            </div>
          </div>
        </div>

        <datalist id="cities">
            {uniqueCities.map(city => <option key={city} value={city} />)}
        </datalist>

        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <div className="relative">
                <label htmlFor="departureDate" className="absolute -top-2.5 rtl:right-3 ltr:left-3 text-xs text-slate-500 bg-white dark:bg-slate-800 px-1">{t('flightSearch.departureDate')}</label>
                <div className="flex items-center">
                    <CalendarIcon className="absolute rtl:right-3 ltr:left-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input type="date" id="departureDate" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={today} className="w-full rtl:pr-10 ltr:pl-10 py-4 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-lg" />
                </div>
            </div>
             <div className={`relative transition-opacity duration-300 ${tripType === TripType.OneWay ? 'opacity-50' : 'opacity-100'}`}>
                <label htmlFor="returnDate" className="absolute -top-2.5 rtl:right-3 ltr:left-3 text-xs text-slate-500 bg-white dark:bg-slate-800 px-1">{t('flightSearch.returnDate')}</label>
                <div className="flex items-center">
                    <CalendarIcon className="absolute rtl:right-3 ltr:left-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input type="date" id="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departureDate} disabled={tripType === TripType.OneWay} className="w-full rtl:pr-10 ltr:pl-10 py-4 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent disabled:bg-slate-50 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:disabled:bg-slate-800 text-lg" />
                </div>
            </div>
        </div>
        
        <div className="relative lg:col-span-2">
             <div ref={popoverRef}>
                <label className="absolute -top-2.5 rtl:right-3 ltr:left-3 text-xs text-slate-500 bg-white dark:bg-slate-800 px-1">{t('flightSearch.passengers')}</label>
                 <button type="button" onClick={() => setIsPassengerPopoverOpen(!isPassengerPopoverOpen)} className="w-full rtl:text-right ltr:text-left rtl:pr-10 ltr:pl-10 py-4 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent flex items-center text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-lg">
                    <UsersIcon className="absolute rtl:right-3 ltr:left-3 w-5 h-5 text-slate-400" />
                    <span>{t('flightSearch.passengerPopover.total', totalPassengers)}</span>
                 </button>
                 {isPassengerPopoverOpen && (
                    <div className="absolute top-full mt-2 w-72 bg-white rounded-lg shadow-lg border z-20 p-4 dark:bg-slate-800 dark:border-slate-700">
                        <PassengerCounter
                            label={t('flightSearch.passengerPopover.adults')}
                            value={passengers.adults}
                            onIncrement={() => handlePassengersChange('adults', 'increment')}
                            onDecrement={() => handlePassengersChange('adults', 'decrement')}
                            isIncrementDisabled={isIncrementDisabled}
                            isDecrementDisabled={passengers.adults <= 1}
                        />
                        <PassengerCounter
                            label={t('flightSearch.passengerPopover.children')}
                            value={passengers.children}
                            onIncrement={() => handlePassengersChange('children', 'increment')}
                            onDecrement={() => handlePassengersChange('children', 'decrement')}
                            isIncrementDisabled={isIncrementDisabled}
                            isDecrementDisabled={passengers.children <= 0}
                        />
                        <PassengerCounter
                            label={t('flightSearch.passengerPopover.infants')}
                            value={passengers.infants}
                            onIncrement={() => handlePassengersChange('infants', 'increment')}
                            onDecrement={() => handlePassengersChange('infants', 'decrement')}
                            isIncrementDisabled={isIncrementDisabled || passengers.infants >= passengers.adults}
                            isDecrementDisabled={passengers.infants <= 0}
                        />
                    </div>
                 )}
            </div>
        </div>
        
        <div className="lg:col-span-1">
            <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-4 px-4 rounded-lg hover:bg-accent-hover transition duration-300 disabled:bg-slate-400 text-lg">
                {isLoading ? '...' : t('flightSearch.search')}
            </button>
        </div>
      </form>
    </div>
  );
};