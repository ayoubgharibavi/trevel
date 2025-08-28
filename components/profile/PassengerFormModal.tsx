

import React, { useState, useEffect } from 'react';
import type { SavedPassenger } from '../../types';
import { Gender, Nationality } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface PassengerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (passengerData: SavedPassenger | Omit<SavedPassenger, 'id'>) => void;
    passengerToEdit: SavedPassenger | null;
}

const createInitialState = (passenger: SavedPassenger | null): Partial<SavedPassenger> => ({
    id: passenger?.id || undefined,
    nationality: passenger?.nationality || Nationality.Iranian,
    firstName: passenger?.firstName || '',
    lastName: passenger?.lastName || '',
    gender: passenger?.gender || Gender.Male,
    nationalId: passenger?.nationalId || '',
    passportNumber: passenger?.passportNumber || '',
    passportIssuingCountry: passenger?.passportIssuingCountry || '',
    dateOfBirth: passenger?.dateOfBirth || '',
    passportExpiryDate: passenger?.passportExpiryDate || '',
});

export const PassengerFormModal: React.FC<PassengerFormModalProps> = ({ isOpen, onClose, onSave, passengerToEdit }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Partial<SavedPassenger>>(createInitialState(passengerToEdit));

    useEffect(() => {
        setFormData(createInitialState(passengerToEdit));
    }, [passengerToEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNationalityChange = (newNationality: Nationality) => {
        const newFormState = { ...formData, nationality: newNationality };
        if (newNationality === Nationality.Iranian) {
            newFormState.passportNumber = '';
            newFormState.passportIssuingCountry = '';
            newFormState.dateOfBirth = '';
            newFormState.passportExpiryDate = '';
        } else {
            newFormState.nationalId = '';
        }
        setFormData(newFormState);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as SavedPassenger);
    };

    const isNew = !formData.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{isNew ? t('profile.savedPassengers.modal.addTitle') : t('profile.savedPassengers.modal.editTitle')}</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center space-x-4 space-x-reverse justify-center">
                        <label className="flex items-center space-x-1 space-x-reverse cursor-pointer">
                            <input type="radio" name="nationality-modal" value={Nationality.Iranian} checked={formData.nationality === Nationality.Iranian} onChange={() => handleNationalityChange(Nationality.Iranian)} className="form-radio" />
                            <span>{t('passengerDetails.iranian')}</span>
                        </label>
                        <label className="flex items-center space-x-1 space-x-reverse cursor-pointer">
                            <input type="radio" name="nationality-modal" value={Nationality.Foreign} checked={formData.nationality === Nationality.Foreign} onChange={() => handleNationalityChange(Nationality.Foreign)} className="form-radio" />
                            <span>{t('passengerDetails.foreign')}</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('passengerDetails.firstName')}</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('passengerDetails.lastName')}</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                        </div>
                        {formData.nationality === Nationality.Iranian ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium">{t('passengerDetails.nationalId')}</label>
                                    <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('passengerDetails.gender')}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white" required>
                                        <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                                        <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium">{t('passengerDetails.passportNumber')}</label>
                                    <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('passengerDetails.dob')}</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">{t('passengerDetails.gender')}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white" required>
                                        <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                                        <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.general.save')}</button>
                </div>
            </form>
        </div>
    );
};