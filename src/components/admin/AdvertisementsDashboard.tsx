
import React, { useState } from 'react';
import type { Advertisement } from '@/types';
import { AdPlacement } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { ToggleOnIcon } from '@/components/icons/ToggleOnIcon';
import { ToggleOffIcon } from '@/components/icons/ToggleOffIcon';

interface AdvertisementsDashboardProps {
    advertisements: Advertisement[];
    onCreate: (ad: Omit<Advertisement, 'id'>) => void;
    onUpdate: (ad: Advertisement) => void;
    onDelete: (adId: string) => void;
}

const AdModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (ad: Advertisement | Omit<Advertisement, 'id'>) => void;
    itemToEdit: Partial<Advertisement> | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Partial<Advertisement>>(
        itemToEdit || { title: '', imageUrl: '', linkUrl: '', placement: AdPlacement.SEARCH_RESULTS_TOP, isActive: true }
    );

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Advertisement);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setFormData(prev => ({ ...prev, imageUrl: loadEvent.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const isNew = !formData.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{isNew ? t('dashboard.ads.modal.addTitle') : t('dashboard.ads.modal.editTitle')}</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium">{t('dashboard.ads.modal.internalTitle')}</label>
                        <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder={t('dashboard.ads.modal.internalTitleHint')} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('dashboard.ads.placement')}</label>
                        <select name="placement" value={formData.placement} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white">
                            <option value={AdPlacement.SEARCH_RESULTS_TOP}>{t('dashboard.ads.placements.SEARCH_RESULTS_TOP')}</option>
                            <option value={AdPlacement.SIDEBAR_BOTTOM}>{t('dashboard.ads.placements.SIDEBAR_BOTTOM')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('dashboard.ads.modal.imageUrl')}</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-full h-32 object-contain my-2 border rounded"/>}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('dashboard.ads.modal.linkUrl')}</label>
                        <input type="url" name="linkUrl" value={formData.linkUrl || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder={t('dashboard.ads.modal.linkUrlHint')} required />
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

export const AdvertisementsDashboard: React.FC<AdvertisementsDashboardProps> = ({ advertisements, onCreate, onUpdate, onDelete }) => {
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

    const handleOpenModal = (ad: Advertisement | null = null) => {
        setEditingAd(ad);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAd(null);
        setIsModalOpen(false);
    };

    const handleSave = (adData: Advertisement | Omit<Advertisement, 'id'>) => {
        if ('id' in adData) {
            onUpdate(adData);
        } else {
            onCreate(adData);
        }
        handleCloseModal();
    };

    const handleToggleStatus = (ad: Advertisement) => {
        onUpdate({ ...ad, isActive: !ad.isActive });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.ads.title')}</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.ads.addNew')}</span>
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.ads.image')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.ads.adTitle')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.ads.placement')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.ads.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {advertisements.map(ad => (
                            <tr key={ad.id}>
                                <td className="px-6 py-4"><img src={ad.imageUrl} alt={ad.title} className="w-24 h-12 object-contain rounded"/></td>
                                <td className="px-6 py-4 font-medium">{ad.title}</td>
                                <td className="px-6 py-4">{t(`dashboard.ads.placements.${ad.placement}`)}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ad.isActive ? t('dashboard.ads.statusValues.active') : t('dashboard.ads.statusValues.inactive')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                                    <button onClick={() => handleToggleStatus(ad)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100" title={ad.isActive ? t('dashboard.flights.toggleOff') : t('dashboard.flights.toggleOn')}>
                                        {ad.isActive ? <ToggleOnIcon className="w-6 h-6 text-green-500" /> : <ToggleOffIcon className="w-6 h-6 text-slate-400" />}
                                    </button>
                                    <button onClick={() => handleOpenModal(ad)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => onDelete(ad.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <AdModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} itemToEdit={editingAd}/>}
        </div>
    );
};
