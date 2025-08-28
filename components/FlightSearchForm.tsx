import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TripType } from '../types';
import type { SearchQuery, Passengers, AirportInfo } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { PlaneTakeoffIcon } from './icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from './icons/PlaneLandingIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ArrowRightLeftIcon } from './icons/ArrowRightLeftIcon';
import { useLocalization } from '../hooks/useLocalization';

interface FlightSearchFormProps {
  onSearch: (query: SearchQuery) => void;
  isLoading: boolean;
  airports: AirportInfo[];
}

const PassengerCounter: React.FC<{ label: string; value: number; onIncrement: () => void; onDecrement: () => void; }> = ({ label, value, onIncrement, onDecrement }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-slate-700">{label}</span>
        <div className="flex items-center space-x-2 space-x-reverse">
            <button type="button" onClick={onDecrement} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50">-</button>
            <span className="w-8 text-center font-medium">{value}</span>
            <button type="button" onClick={onIncrement} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300">+</button>
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

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-white/20">
      <div className="flex items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
            <button
            onClick={() => setTripType(TripType.RoundTrip)}
            className={`px-6 py-3 rounded-full text-base font-medium transition ${tripType === TripType.RoundTrip ? 'bg-blue-100 text-primary' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            {t('flightSearch.tripType.roundTrip')}
            </button>
            <button
            onClick={() => setTripType(TripType.OneWay)}
            className={`px-6 py-3 rounded-full text-base font-medium transition ${tripType === TripType.OneWay ? 'bg-blue-100 text-primary' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            {t('flightSearch.tripType.oneWay')}
            </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-end">
        <div className="relative lg:col-span-3 flex items-center">
            <div className="flex-1 relative">
                <label htmlFor="from" className="absolute -top-3.5 rtl:right-4 ltr:left-4 text-base text-slate-500 bg-white dark:bg-slate-800 px-2">{t('flightSearch.from')}</label>
                <div className="flex items-center">
                    <PlaneTakeoffIcon className="absolute rtl:right-4 ltr:left-4 w-6 h-6 text-slate-400 pointer-events-none" />
                    <input type="text" id="from" value={from} onChange={(e) => setFrom(e.target.value)} list="cities" className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-5 ltr:pr-5 py-6 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xl" />
                </div>
            </div>
            
            <button type="button" onClick={handleSwap} className="mx-2 p-3 rounded-full border bg-white hover:bg-slate-100 transition z-10 flex-shrink-0 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600" title={t('flightSearch.swap')}>
                <ArrowRightLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

             <div className="flex-1 relative">
                <label htmlFor="to" className="absolute -top-3.5 rtl:right-4 ltr:left-4 text-base text-slate-500 bg-white dark:bg-slate-800 px-2">{t('flightSearch.to')}</label>
                <div className="flex items-center">
                    <PlaneLandingIcon className="absolute rtl:right-4 ltr:left-4 w-6 h-6 text-slate-400 pointer-events-none" />
                    <input type="text" id="to" value={to} onChange={(e) => setTo(e.target.value)} list="cities" className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-5 ltr:pr-5 py-6 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xl" />
                </div>
            </div>
            <datalist id="cities">
                {uniqueCities.map(city => <option key={city} value={city} />)}
            </datalist>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <div className="relative">
                <label htmlFor="departureDate" className="absolute -top-3.5 rtl:right-4 ltr:left-4 text-base text-slate-500 bg-white dark:bg-slate-800 px-2">{t('flightSearch.departureDate')}</label>
                 <div className="flex items-center">
                    <CalendarIcon className="absolute rtl:right-4 ltr:left-4 w-6 h-6 text-slate-400 pointer-events-none" />
                    <input type="date" id="departureDate" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={today} className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-5 ltr:pr-5 py-6 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xl" />
                </div>
            </div>
             <div className={`relative transition-opacity duration-300 ${tripType === TripType.OneWay ? 'opacity-50' : 'opacity-100'}`}>
                <label htmlFor="returnDate" className="absolute -top-3.5 rtl:right-4 ltr:left-4 text-base text-slate-500 bg-white dark:bg-slate-800 px-2">{t('flightSearch.returnDate')}</label>
                <div className="flex items-center">
                    <CalendarIcon className="absolute rtl:right-4 ltr:left-4 w-6 h-6 text-slate-400 pointer-events-none" />
                    <input type="date" id="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departureDate} disabled={tripType === TripType.OneWay} className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-5 ltr:pr-5 py-6 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent disabled:bg-slate-50 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:disabled:bg-slate-800 text-xl" />
                </div>
            </div>
        </div>
        
        <div className="relative lg:col-span-2">
             <div ref={popoverRef}>
                <label className="absolute -top-3.5 rtl:right-4 ltr:left-4 text-base text-slate-500 bg-white dark:bg-slate-800 px-2">{t('flightSearch.passengers')}</label>
                 <button type="button" onClick={() => setIsPassengerPopoverOpen(!isPassengerPopoverOpen)} className="w-full rtl:text-right ltr:text-left rtl:pr-12 ltr:pl-12 rtl:pl-5 ltr:pr-5 py-6 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent flex items-center text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xl">
                    <UsersIcon className="absolute rtl:right-4 ltr:left-4 w-6 h-6 text-slate-400" />
                    <span>{t('flightSearch.passengerPopover.total', totalPassengers)}</span>
                 </button>
                 {isPassengerPopoverOpen && (
                    <div className="absolute top-full mt-2 w-72 bg-white rounded-lg shadow-lg border z-20 p-4 dark:bg-slate-800 dark:border-slate-700">
                        <PassengerCounter label={t('flightSearch.passengerPopover.adults')} value={passengers.adults} onIncrement={() => setPassengers(p => ({...p, adults: p.adults + 1}))} onDecrement={() => setPassengers(p => ({...p, adults: Math.max(1, p.adults - 1)}))} />
                        <PassengerCounter label={t('flightSearch.passengerPopover.children')} value={passengers.children} onIncrement={() => setPassengers(p => ({...p, children: p.children + 1}))} onDecrement={() => setPassengers(p => ({...p, children: Math.max(0, p.children - 1)}))} />
                        <PassengerCounter label={t('flightSearch.passengerPopover.infants')} value={passengers.infants} onIncrement={() => setPassengers(p => ({...p, infants: p.infants + 1}))} onDecrement={() => setPassengers(p => ({...p, infants: Math.max(0, p.infants - 1)}))} />
                    </div>
                 )}
            </div>
        </div>
        
        <div className="lg:col-span-2">
            <button type="submit" disabled={isLoading} className="w-full h-full bg-accent text-white font-bold py-6 px-4 rounded-lg hover:bg-accent-hover transition duration-300 disabled:bg-slate-400 text-xl">
                {t('flightSearch.search')}
            </button>
        </div>
      </form>
    </div>
  );
};