import React from 'react';
import type { Flight } from '../types';
import { PlaneTakeoffIcon } from './icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from './icons/PlaneLandingIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useLocalization } from '../hooks/useLocalization';
import { InfoIcon } from './icons/InfoIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface DetailedFlightSummaryCardProps {
    flight: Flight;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="text-slate-500 mt-0.5">{icon}</div>
        <div>
            <p className="text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value}</p>
        </div>
    </div>
);


export const DetailedFlightSummaryCard: React.FC<DetailedFlightSummaryCardProps> = ({ flight }) => {
    const { t, formatDate, formatTime } = useLocalization();

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 space-y-5">
            {/* Airline Info */}
            <div className="flex items-center space-x-4 space-x-reverse pb-4 border-b border-slate-200/80">
                <img src={flight.airlineLogoUrl} alt={`${flight.airline} logo`} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h3 className="text-xl font-bold text-primary">{flight.airline}</h3>
                    <p className="text-base text-slate-600">{flight.aircraft} | {flight.flightNumber}</p>
                </div>
            </div>
            
            {/* Journey Timeline */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <PlaneTakeoffIcon className="w-7 h-7 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{flight.departure?.city || 'نامشخص'} ({flight.departure?.airportCode || 'نامشخص'})</p>
                            <p className="text-sm text-slate-500">{flight.departure?.dateTime ? formatDate(flight.departure.dateTime) : 'نامشخص'}</p>
                        </div>
                    </div>
                    <p className="text-xl font-bold text-slate-800">{flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : 'نامشخص'}</p>
                </div>

                <div className="my-3 pr-10">
                    <div className="border-r-2 border-dashed border-slate-300 h-8 flex items-center">
                        <div className="flex items-center text-sm text-slate-500 -mr-3 bg-white pr-2">
                            <ArrowLeftIcon className="w-4 h-4 text-slate-400 ml-2 transform -rotate-90" />
                            <span>{flight.duration}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <PlaneLandingIcon className="w-7 h-7 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{flight.arrival?.city || 'نامشخص'} ({flight.arrival?.airportCode || 'نامشخص'})</p>
                            <p className="text-sm text-slate-500">{flight.arrival?.dateTime ? formatDate(flight.arrival.dateTime) : 'نامشخص'}</p>
                        </div>
                    </div>
                    <p className="text-xl font-bold text-slate-800">{flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : 'نامشخص'}</p>
                </div>
            </div>

            {/* Additional Details */}
            <div className="pt-5 border-t border-slate-200/80">
                 <h4 className="text-md font-bold text-slate-800 mb-4">{t('flightCard.detailsAndRules')}</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem 
                        icon={<InfoIcon className="w-5 h-5"/>} 
                        label={t('flightCard.class')} 
                        value={flight.flightClass}
                    />
                     <DetailItem 
                        icon={<InfoIcon className="w-5 h-5"/>} 
                        label={t('flightCard.stops')} 
                        value={flight.stops === 0 ? t('flightCard.direct') : t('flightCard.stops', flight.stops)}
                    />
                     <DetailItem 
                        icon={<BriefcaseIcon className="w-5 h-5"/>} 
                        label={t('flightCard.baggageAllowance')} 
                        value={flight.baggageAllowance}
                    />
                 </div>
            </div>
        </div>
    );
};