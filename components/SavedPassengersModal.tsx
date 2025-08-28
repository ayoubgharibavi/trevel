

import React, { useState, useMemo } from 'react';
import type { SavedPassenger } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { UserIcon } from './icons/UserIcon';

interface SavedPassengersModalProps {
    isOpen: boolean;
    onClose: () => void;
    passengers: SavedPassenger[];
    onSelect: (passenger: SavedPassenger) => void;
}

export const SavedPassengersModal: React.FC<SavedPassengersModalProps> = ({ isOpen, onClose, passengers, onSelect }) => {
    const { t } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPassengers = useMemo(() => {
        if (!searchTerm) return passengers;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return passengers.filter(p =>
            p.firstName.toLowerCase().includes(lowerCaseSearch) ||
            p.lastName.toLowerCase().includes(lowerCaseSearch) ||
            p.nationalId?.includes(lowerCaseSearch) ||
            p.passportNumber?.includes(lowerCaseSearch)
        );
    }, [passengers, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('passengerDetails.savedPassengersModal.title')}</h3>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('passengerDetails.savedPassengersModal.searchPlaceholder')}
                        className="mt-2 w-full p-2 border rounded-md"
                    />
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {filteredPassengers.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredPassengers.map(p => (
                                <li key={p.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                                    <div className="flex items-center">
                                        <UserIcon className="w-5 h-5 text-slate-500 mr-3" />
                                        <div>
                                            <p className="font-semibold">{p.firstName} {p.lastName}</p>
                                            <p className="text-sm text-slate-500">{p.nationalId || p.passportNumber}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onSelect(p)} className="text-sm bg-primary text-white font-semibold py-1 px-3 rounded-md hover:bg-purple-800 transition">
                                        {t('passengerDetails.savedPassengersModal.select')}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-slate-500 py-8">
                            <p>{t('passengerDetails.savedPassengersModal.notFound')}</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">
                        {t('dashboard.general.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};