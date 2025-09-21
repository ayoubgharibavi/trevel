
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
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={flight.airlineLogoUrl} alt={`${flight.airline} logo`} className="w-12 h-12 rounded-2xl object-cover shadow-md" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{flight.airline}</h3>
                        <p className="text-sm text-slate-500 font-medium">{flight.aircraft} | {flight.flightNumber}</p>
                    </div>
                </div>
            </div>
            
            {/* Flight Details */}
            <div className="p-6 space-y-6">
                {/* Departure */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <PlaneTakeoffIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{flight.departure?.city || 'نامشخص'}</p>
                            <p className="text-sm text-slate-500 font-medium">{flight.departure?.airportCode || 'نامشخص'}</p>
                            <p className="text-xs text-slate-400">{flight.departure?.dateTime ? formatDate(flight.departure.dateTime) : 'نامشخص'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">{flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : 'نامشخص'}</p>
                        <p className="text-xs text-slate-500">خروج</p>
                    </div>
                </div>

                {/* Flight Path */}
                <div className="relative">
                    <div className="flex items-center justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 rounded-full relative">
                            <div className="w-3 h-3 rounded-full border-3 border-blue-500 bg-white absolute top-1/2 left-0 -translate-y-1/2 shadow-md"></div>
                            <ArrowLeftIcon className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 shadow-md"/>
                            <div className="w-3 h-3 rounded-full bg-blue-500 absolute top-1/2 right-0 -translate-y-1/2 shadow-md"></div>
                        </div>
                    </div>
                    <div className="text-center mt-3">
                        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                            {flight.duration || 'نامشخص'}
                        </span>
                    </div>
                </div>

                {/* Arrival */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <PlaneLandingIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{flight.arrival?.city || 'نامشخص'}</p>
                            <p className="text-sm text-slate-500 font-medium">{flight.arrival?.airportCode || 'نامشخص'}</p>
                            <p className="text-xs text-slate-400">{flight.arrival?.dateTime ? formatDate(flight.arrival.dateTime) : 'نامشخص'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">{flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : 'نامشخص'}</p>
                        <p className="text-xs text-slate-500">ورود</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
