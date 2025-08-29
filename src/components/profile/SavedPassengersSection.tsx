

import React, { useState } from 'react';
import type { SavedPassenger } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PassengerFormModal } from './PassengerFormModal';

interface SavedPassengersSectionProps {
    passengers: SavedPassenger[];
    onAdd: (passenger: Omit<SavedPassenger, 'id'>) => void;
    onUpdate: (passenger: SavedPassenger) => void;
    onDelete: (passengerId: string) => void;
}

export const SavedPassengersSection: React.FC<SavedPassengersSectionProps> = ({ passengers, onAdd, onUpdate, onDelete }) => {
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPassenger, setEditingPassenger] = useState<SavedPassenger | null>(null);

    const handleOpenModal = (passenger: SavedPassenger | null = null) => {
        setEditingPassenger(passenger);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingPassenger(null);
        setIsModalOpen(false);
    };

    const handleSave = (passengerData: SavedPassenger | Omit<SavedPassenger, 'id'>) => {
        if ('id' in passengerData) {
            onUpdate(passengerData);
        } else {
            onAdd(passengerData);
        }
        handleCloseModal();
    };

    const handleDelete = (passengerId: string) => {
        if (window.confirm(t('profile.savedPassengers.deleteConfirm'))) {
            onDelete(passengerId);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('profile.savedPassengers.title')}</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('profile.savedPassengers.addPassenger')}</span>
                </button>
            </div>
            
            {passengers.length > 0 ? (
                <div className="space-y-3">
                    {passengers.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-slate-50">
                            <div>
                                <p className="font-semibold">{p.firstName} {p.lastName}</p>
                                <p className="text-sm text-slate-500">{t(`passengerDetails.${p.nationality.toLowerCase()}` as any)} - {p.nationalId || p.passportNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500">
                    <p>{t('profile.savedPassengers.noPassengers')}</p>
                </div>
            )}

            {isModalOpen && (
                <PassengerFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    passengerToEdit={editingPassenger}
                />
            )}
        </div>
    );
};