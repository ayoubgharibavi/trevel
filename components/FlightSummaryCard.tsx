
import React from 'react';
import type { Flight } from '../types';
import { PlaneTakeoffIcon } from './icons/PlaneTakeoffIcon';
import { PlaneLandingIcon } from './icons/PlaneLandingIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useLocalization } from '../hooks/useLocalization';

interface FlightSummaryCardProps {
    flight: Flight;
}

export const FlightSummaryCard: React.FC<FlightSummaryCardProps> = ({ flight }) => {
    const { formatDate, formatTime } = useLocalization();

    return (
        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
            <div className="flex items-center space-x-4 space-x-reverse pb-4">
                <img src={flight.airlineLogoUrl} alt={`${flight.airline} logo`} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h3 className="text-lg font-bold text-primary">{flight.airline}</h3>
                    <p className="text-sm text-slate-500">{flight.aircraft} | {flight.flightNumber}</p>
                </div>
            </div>
            
            <div className="border-t border-b border-slate-200 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <PlaneTakeoffIcon className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-800">{flight.departure.city} ({flight.departure.airportCode})</p>
                            <p className="text-sm text-slate-500">{formatDate(flight.departure.dateTime)}</p>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{formatTime(flight.departure.dateTime)}</p>
                </div>

                <div className="my-3 pr-9">
                    <div className="border-r-2 border-dashed border-slate-300 h-8 flex items-center">
                        <div className="flex items-center text-sm text-slate-500 -mr-3 bg-white pr-2">
                             <ArrowLeftIcon className="w-4 h-4 text-slate-400 ml-2 transform -rotate-90" />
                            <span>{flight.duration}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                     <div className="flex items-center space-x-3 space-x-reverse">
                        <PlaneLandingIcon className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-800">{flight.arrival.city} ({flight.arrival.airportCode})</p>
                            <p className="text-sm text-slate-500">{formatDate(flight.arrival.dateTime)}</p>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{formatTime(flight.arrival.dateTime)}</p>
                </div>
            </div>
        </div>
    );
};
