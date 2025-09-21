import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TripType } from '@/types';
import type { SearchQuery, Passengers, AirportInfo } from '@/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from '@/components/icons/PlaneLandingIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ArrowRightLeftIcon } from '@/components/icons/ArrowRightLeftIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
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
    <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center space-x-3 space-x-reverse">
            <button 
                type="button" 
                onClick={onDecrement} 
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center" 
                disabled={isDecrementDisabled}
            >
                <span className="text-lg font-bold">−</span>
            </button>
            <span className="w-8 text-center font-bold text-lg text-gray-900">{value}</span>
            <button 
                type="button" 
                onClick={onIncrement} 
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center" 
                disabled={isIncrementDisabled}
            >
                <span className="text-lg font-bold">+</span>
            </button>
        </div>
    </div>
);

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch, isLoading, airports }) => {
  const { t, language } = useLocalization();
  const [tripType, setTripType] = useState<TripType>(TripType.RoundTrip);
  
  const tehran = useMemo(() => airports.find(a => a.iata === 'IKA')?.city[language] || (language === 'ar' ? 'طهران' : 'تهران'), [airports, language]);
  const istanbul = useMemo(() => airports.find(a => a.iata === 'IST')?.city[language] || (language === 'ar' ? 'إسطنبول' : 'استانبول'), [airports, language]);

  const today = new Date().toISOString().split('T')[0];

  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
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
    const uniqueCityNames = [...new Set(cities)];
    
    // Also include airport names and IATA codes for better search experience
    const airportOptions = airports.map(a => `${a.city[language]} (${a.iata})`);
    const airportNames = airports.map(a => a.name[language]);
    
    return [...new Set([...uniqueCityNames, ...airportOptions, ...airportNames])];
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

    // Only translate if the fields are not empty
    if (from) {
      const fromAirport = findAirportByAnyCityName(from);
      const newFrom = fromAirport ? fromAirport.city[language] : from;
      if (newFrom !== from) {
        setFrom(newFrom);
      }
    }
    
    if (to) {
      const toAirport = findAirportByAnyCityName(to);
      const newTo = toAirport ? toAirport.city[language] : to;
      if (newTo !== to) {
        setTo(newTo);
      }
    }
  }, [language, airports, from, to]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    // Validate required fields
    if (!from.trim()) {
      alert(t('flightSearch.validation.fromRequired'));
      return;
    }
    
    if (!to.trim()) {
      alert(t('flightSearch.validation.toRequired'));
      return;
    }
    
    if (from.trim() === to.trim()) {
      alert(t('flightSearch.validation.sameOriginDestination'));
      return;
    }
    
    const query: SearchQuery = {
      tripType,
      from: from.trim(),
      to: to.trim(),
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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-soft border border-white/20 p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {t('flightSearch.title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('flightSearch.subtitle')}
        </p>
      </div>

      {/* Trip Type Selector */}
      <div className="mb-8 max-w-xs mx-auto">
        <div className="bg-gray-100 p-1 rounded-full flex items-center">
          <button
            type="button"
            onClick={() => setTripType(TripType.RoundTrip)}
            className={`w-full px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              tripType === TripType.RoundTrip 
                ? 'bg-white shadow-medium text-primary-600 transform scale-105' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('flightSearch.tripType.roundTrip')}
          </button>
          <button
            type="button"
            onClick={() => setTripType(TripType.OneWay)}
            className={`w-full px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              tripType === TripType.OneWay 
                ? 'bg-white shadow-medium text-primary-600 transform scale-105' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('flightSearch.tripType.oneWay')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
              {t('flightSearch.from')}
            </label>
            <div className="relative">
              <PlaneTakeoffIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                id="from" 
                value={from} 
                onChange={(e) => setFrom(e.target.value)} 
                list="cities" 
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-200 hover:border-gray-400" 
                placeholder={t('flightSearch.fromPlaceholder')}
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              {t('flightSearch.to')}
            </label>
            <div className="relative">
              <PlaneLandingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                id="to" 
                value={to} 
                onChange={(e) => setTo(e.target.value)} 
                list="cities" 
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-200 hover:border-gray-400" 
                placeholder={t('flightSearch.toPlaceholder')}
              />
            </div>
          </div>
        </div>

        <datalist id="cities">
          {uniqueCities.map((city, index) => <option key={`city-${index}`} value={city} />)}
        </datalist>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={handleSwap} 
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-soft"
            title={t('flightSearch.swap')}
          >
            <ArrowRightLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Dates and Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('flightSearch.departureDate')}
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                id="departureDate" 
                value={departureDate} 
                onChange={(e) => setDepartureDate(e.target.value)} 
                min={today} 
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-200 hover:border-gray-400" 
              />
            </div>
          </div>

          <div className={`relative transition-all duration-300 ${tripType === TripType.OneWay ? 'opacity-50' : 'opacity-100'}`}>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('flightSearch.returnDate')}
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                id="returnDate" 
                value={returnDate} 
                onChange={(e) => setReturnDate(e.target.value)} 
                min={departureDate} 
                disabled={tripType === TripType.OneWay} 
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-lg transition-all duration-200 hover:border-gray-400" 
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('flightSearch.passengers')}
            </label>
            <div ref={popoverRef} className="relative">
              <button 
                type="button" 
                onClick={() => setIsPassengerPopoverOpen(!isPassengerPopoverOpen)} 
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left flex items-center text-lg transition-all duration-200 hover:border-gray-400"
              >
                <UsersIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                <span className="font-medium">{t('flightSearch.passengerPopover.total', totalPassengers)}</span>
              </button>
              
              {isPassengerPopoverOpen && (
                <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-medium border border-gray-200 z-20 animate-fade-in">
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('flightSearch.passengerPopover.title')}</h3>
                    <div className="space-y-2">
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <div className="flex justify-center pt-4">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-12 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-medium hover:shadow-strong transform hover:scale-105 flex items-center space-x-2 space-x-reverse"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('flightSearch.searching')}</span>
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                <span>{t('flightSearch.search')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};