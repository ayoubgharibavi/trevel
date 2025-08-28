
import React, { useState, useEffect, useMemo } from 'react';
import type { RateLimit, AirportInfo } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { useLocalization } from '../../hooks/useLocalization';

interface RateLimitsManagerProps {
    rateLimits: RateLimit[];
    airports: AirportInfo[];
    onCreate: (data: Omit<RateLimit, 'id'>) => void;
    onUpdate: (data: RateLimit) => void;
    onDelete: (id: string) => void;
}

const DataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RateLimit | Omit<RateLimit, 'id'>) => void;
    item: Partial<RateLimit> | null;
    cities: string[];
}> = ({ isOpen, onClose, onSave, item, cities }) => {
    const [formData, setFormData] = useState<Partial<RateLimit>>({});

    useEffect(() => {
        setFormData(item || { fromCity: '', toCity: '', maxPrice: 0 });
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as RateLimit);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const isNew = !formData.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <form className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">{isNew ? 'افزودن محدودیت نرخ' : 'ویرایش محدودیت نرخ'}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">شهر مبدا</label>
                        <select name="fromCity" value={formData.fromCity || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>انتخاب کنید...</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">شهر مقصد</label>
                        <select name="toCity" value={formData.toCity || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>انتخاب کنید...</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">حداکثر قیمت (تومان)</label>
                        <input type="number" step="1000" name="maxPrice" value={formData.maxPrice || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">لغو</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">ذخیره</button>
                </div>
            </form>
        </div>
    );
};

export const RateLimitsManager: React.FC<RateLimitsManagerProps> = ({ rateLimits, airports, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RateLimit | null>(null);
    const { language } = useLocalization();

    const uniqueCities = useMemo(() => {
        const cities = airports.map(a => a.city[language]);
        return [...new Set(cities)].sort();
    }, [airports, language]);

    const handleOpenModal = (item: RateLimit | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: RateLimit | Omit<RateLimit, 'id'>) => {
        if ('id' in data && data.id) {
            onUpdate(data);
        } else {
            onCreate(data as Omit<RateLimit, 'id'>);
        }
        handleCloseModal();
    };

    return (
        <div className="mt-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>افزودن محدودیت جدید</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبدا</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مقصد</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حداکثر قیمت</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rateLimits.map(limit => (
                            <tr key={limit.id}>
                                <td className="px-6 py-4 font-medium">{limit.fromCity}</td>
                                <td className="px-6 py-4 font-medium">{limit.toCity}</td>
                                <td className="px-6 py-4 font-mono font-semibold">{limit.maxPrice.toLocaleString('fa-IR')} تومان</td>
                                <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                                    <button onClick={() => handleOpenModal(limit)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => onDelete(limit.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                         {rateLimits.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500">
                                    هیچ محدودیتی ثبت نشده است.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
            <DataModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                item={editingItem}
                cities={uniqueCities}
            />
        </div>
    );
};
