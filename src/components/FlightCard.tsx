import React, { useState } from 'react';
import type { Flight, RefundPolicy, User, CurrencyInfo } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SeatIcon } from './icons/SeatIcon';
import { InfoIcon } from './icons/InfoIcon';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CurrencyDisplay } from './CurrencyDisplay';
import { PlaneIcon } from './icons/PlaneIcon';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  currentUser: User | null;
  currencies: CurrencyInfo[];
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect, refundPolicies, currentUser, currencies }) => {
  const totalPrice = (typeof flight.price === 'string' ? parseInt(flight.price) : flight.price) + (typeof flight.taxes === 'string' ? parseInt(flight.taxes) : flight.taxes);
  const { t, formatTime, formatNumber, language } = useLocalization();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const policy = refundPolicies.find(p => p.id === flight.refundPolicyId);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-200/60 group">
      <div className="p-8 flex flex-col lg:flex-row items-center gap-8">
        {/* Main Info Container */}
        <div className="flex-grow w-full space-y-6">
           {/* Top Row: Journey */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left Section: Airline Info */}
            <div className="w-full lg:w-48 text-center lg:text-right flex-shrink-0 flex items-center lg:flex-col gap-4">
              <div className="relative">
                <img 
                  src={flight.airlineLogoUrl} 
                  alt={`${typeof flight.airline === 'string' ? flight.airline : flight.airline?.name || 'Airline'} logo`} 
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300" 
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow lg:text-center">
                <p className="font-bold text-slate-800 text-xl mb-1">{typeof flight.airline === 'string' ? flight.airline : flight.airline?.name || 'نامشخص'}</p>
                <p className="text-sm text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-full inline-block">{flight.flightNumber}</p>
              </div>
            </div>

            {/* Middle Section: Journey Details */}
            <div className="flex-grow w-full flex items-center justify-between">
                <div className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    {flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : 'نامشخص'}
                  </p>
                  <p className="text-xl font-bold text-slate-700 mb-1">{flight.departure?.airportCode || 'نامشخص'}</p>
                  <p className="text-sm text-slate-500 font-medium">{flight.departure?.city || 'نامشخص'}</p>
                </div>
                
                <div className="flex-grow flex flex-col items-center px-6 w-32 lg:w-auto">
                  <span className="text-sm text-slate-500 mb-2 font-medium bg-slate-100 px-3 py-1 rounded-full">
                    {typeof flight.duration === 'number' ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : flight.duration}
                  </span>
                  <div className="w-full h-1 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 relative rounded-full">
                      <div className="w-3 h-3 rounded-full border-3 border-blue-500 bg-white absolute top-1/2 left-0 -translate-y-1/2 shadow-md"></div>
                      <PlaneIcon className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 shadow-md"/>
                      <div className="w-3 h-3 rounded-full bg-blue-500 absolute top-1/2 right-0 -translate-y-1/2 shadow-md"></div>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 font-medium">
                      {flight.stops === 0 ? t('flightCard.direct') : t('flightCard.stops', flight.stops)}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    {flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : 'نامشخص'}
                  </p>
                  <p className="text-xl font-bold text-slate-700 mb-1">{flight.arrival?.airportCode || 'نامشخص'}</p>
                  <p className="text-sm text-slate-500 font-medium">{flight.arrival?.city || 'نامشخص'}</p>
                </div>
            </div>
          </div>
          
           {/* Bottom Row: Extra Details */}
           <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 pt-6 border-t border-slate-200/80">
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full" title={t('flightCard.aircraft')}>
                    <InfoIcon className="w-4 h-4 text-blue-500 mr-2"/>
                    <span className="font-semibold">{flight.aircraft}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full" title={t('flightCard.class')}>
                    <InfoIcon className="w-4 h-4 text-blue-500 mr-2"/>
                    <span className="font-semibold">{flight.flightClass}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full" title={t('flightCard.remainingSeats')}>
                    <SeatIcon className="w-4 h-4 text-green-500 mr-2"/>
                    <span className="font-semibold">{`${formatNumber(flight.availableSeats)} ${t('flightCard.seat')}`}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full" title={t('flightCard.baggageAllowance')}>
                    <BriefcaseIcon className="w-4 h-4 text-purple-500 mr-2"/>
                    <span className="font-semibold">{flight.baggageAllowance}</span>
                </div>
            </div>
        </div>
        
        {/* Right Section: Price & CTA */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-8 flex flex-col items-center lg:items-end justify-center lg:w-64 w-full flex-shrink-0">
          <div className="text-center lg:text-right mb-4">
            <CurrencyDisplay 
                valueIRR={totalPrice}
                currentUser={currentUser}
                currencies={currencies}
                mainClassName="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                subClassName="text-sm text-slate-500 -mt-1"
            />
            <p className="text-sm text-slate-500 font-medium mt-2">{t('flightCard.totalPrice')}</p>
          </div>
          <button
            onClick={() => onSelect(flight)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>{t('flightCard.selectFlight')}</span>
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </button>
        </div>
      </div>
       {/* Collapsible Section */}
      <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full flex justify-between items-center p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100/50 transition-colors"
          aria-expanded={isDetailsOpen}
          aria-controls={`flight-details-${flight.id}`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('flightCard.detailsAndRules')}
          </span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDetailsOpen && (
          <div id={`flight-details-${flight.id}`} className="p-6 text-sm text-slate-700 bg-white/50">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {policy ? policy.name[language] : t('flightCard.rulesTitle')}:
              </p>
              {policy && policy.rules.length > 0 ? (
                  <ul className="space-y-2 text-slate-600">
                      {policy.rules.sort((a,b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture).map(rule => (
                          <li key={rule.id} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{t('profile.myBookings.cancelModal.policyRule', rule.hoursBeforeDeparture, rule.penaltyPercentage)}</span>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-slate-600 italic">{t('flightCard.noRulesAvailable')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};