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
  const totalPrice = flight.price + flight.taxes;
  const { t, formatTime, formatNumber, language } = useLocalization();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const policy = refundPolicies.find(p => p.id === flight.refundPolicyId);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200/80">
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        {/* Main Info Container */}
        <div className="flex-grow w-full space-y-4">
           {/* Top Row: Journey */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left Section: Airline Info */}
            <div className="w-full md:w-40 text-center md:text-right flex-shrink-0 flex items-center md:flex-col gap-3">
              <img src={flight.airlineLogoUrl} alt={`${flight.airline} logo`} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div className="flex-grow md:text-center">
                <p className="font-bold text-primary text-lg">{flight.airline}</p>
                <p className="text-xs text-slate-500 font-mono">{flight.flightNumber}</p>
              </div>
            </div>

            {/* Middle Section: Journey Details */}
            <div className="flex-grow w-full flex items-center justify-between">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800">{formatTime(flight.departure.dateTime)}</p>
                  <p className="text-lg font-semibold text-slate-600">{flight.departure.airportCode}</p>
                  <p className="text-sm text-slate-500">{flight.departure.city}</p>
                </div>
                
                <div className="flex-grow flex flex-col items-center px-4 w-24 md:w-auto">
                  <span className="text-xs text-slate-500 mb-1">{flight.duration}</span>
                  <div className="w-full h-0.5 bg-slate-200 relative">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white absolute top-1/2 left-0 -translate-y-1/2"></div>
                      <PlaneIcon className="w-5 h-5 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1"/>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute top-1/2 right-0 -translate-y-1/2"></div>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                      {flight.stops === 0 ? t('flightCard.direct') : t('flightCard.stops', flight.stops)}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800">{formatTime(flight.arrival.dateTime)}</p>
                  <p className="text-lg font-semibold text-slate-600">{flight.arrival.airportCode}</p>
                  <p className="text-sm text-slate-500">{flight.arrival.city}</p>
                </div>
            </div>
          </div>
          
           {/* Bottom Row: Extra Details */}
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-4 border-t border-slate-200/80">
                <div className="flex items-center text-sm text-slate-600" title={t('flightCard.aircraft')}>
                    <InfoIcon className="w-4 h-4 text-slate-500 mr-1.5"/>
                    <span className="font-medium">{flight.aircraft}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600" title={t('flightCard.class')}>
                    <InfoIcon className="w-4 h-4 text-slate-500 mr-1.5"/>
                    <span className="font-medium">{flight.flightClass}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600" title={t('flightCard.remainingSeats')}>
                    <SeatIcon className="w-4 h-4 text-slate-500 mr-1.5"/>
                    <span className="font-medium">{`${formatNumber(flight.availableSeats)} ${t('flightCard.seat')}`}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600" title={t('flightCard.baggageAllowance')}>
                    <BriefcaseIcon className="w-4 h-4 text-slate-500 mr-1.5"/>
                    <span className="font-medium">{flight.baggageAllowance}</span>
                </div>
            </div>
        </div>
        
        {/* Right Section: Price & CTA */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6 flex flex-col items-center md:items-end justify-center md:w-56 w-full flex-shrink-0">
          <CurrencyDisplay 
              valueIRR={totalPrice}
              currentUser={currentUser}
              currencies={currencies}
              mainClassName="text-2xl font-bold text-accent"
              subClassName="text-xs text-slate-500 -mt-1"
          />
          <p className="text-sm text-slate-500 mb-3">{t('flightCard.totalPrice')}</p>
          <button
            onClick={() => onSelect(flight)}
            className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition duration-300 flex items-center justify-center text-base"
          >
            <span>{t('flightCard.selectFlight')}</span>
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </button>
        </div>
      </div>
       {/* Collapsible Section */}
      <div className="border-t border-slate-200/60 bg-slate-50">
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full flex justify-between items-center p-3 text-sm font-semibold text-primary hover:bg-slate-100 transition-colors"
          aria-expanded={isDetailsOpen}
          aria-controls={`flight-details-${flight.id}`}
        >
          <span>{t('flightCard.detailsAndRules')}</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDetailsOpen && (
          <div id={`flight-details-${flight.id}`} className="p-4 text-sm text-slate-700">
            <div>
              <p><strong>{policy ? policy.name[language] : t('flightCard.rulesTitle')}:</strong></p>
              {policy && policy.rules.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {policy.rules.sort((a,b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture).map(rule => (
                          <li key={rule.id}>
                              {t('profile.myBookings.cancelModal.policyRule', rule.hoursBeforeDeparture, rule.penaltyPercentage)}
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-slate-600">{t('flightCard.noRulesAvailable')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};