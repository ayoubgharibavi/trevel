


import React, { useState } from 'react';
import type { SiteContent, FooterLink, PopularDestination } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ContentDashboardProps {
    content: SiteContent;
    onUpdate: (newContent: SiteContent) => void;
}

const LocalizedTextarea: React.FC<{
    label: string;
    value: SiteContent['about']['body']; // LocalizedName
    onChange: (lang: 'fa' | 'ar' | 'en', value: string) => void;
}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea value={value.fa} onChange={e => onChange('fa', e.target.value)} placeholder="فارسی" className="w-full p-2 border rounded mb-1 text-sm" rows={3}></textarea>
        <textarea value={value.ar} onChange={e => onChange('ar', e.target.value)} placeholder="العربية" className="w-full p-2 border rounded mb-1 text-sm" rows={3}></textarea>
        <textarea value={value.en} onChange={e => onChange('en', e.target.value)} placeholder="English" className="w-full p-2 border rounded text-sm" rows={3}></textarea>
    </div>
);

const LocalizedInput: React.FC<{
    label: string;
    value: SiteContent['about']['title']; // LocalizedName
    onChange: (lang: 'fa' | 'ar' | 'en', value: string) => void;
}> = ({ label, value, onChange }) => (
     <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input type="text" value={value.fa} onChange={e => onChange('fa', e.target.value)} placeholder="فارسی" className="w-full p-2 border rounded mb-1 text-sm" />
        <input type="text" value={value.ar} onChange={e => onChange('ar', e.target.value)} placeholder="العربية" className="w-full p-2 border rounded mb-1 text-sm" />
        <input type="text" value={value.en} onChange={e => onChange('en', e.target.value)} placeholder="English" className="w-full p-2 border rounded text-sm" />
    </div>
);


export const ContentDashboard: React.FC<ContentDashboardProps> = ({ content, onUpdate }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<SiteContent>(content);
    const [feedback, setFeedback] = useState('');

    const handleUpdate = <T extends keyof SiteContent, K extends keyof SiteContent[T]>(
        page: T,
        field: K,
        value: SiteContent[T][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [field]: value
            }
        }));
    };

    const handleLocalizedUpdate = <
        T extends keyof SiteContent,
        K extends keyof SiteContent[T] & ('title' | 'body' | 'address' | 'description' | 'subtitle')
    >(
        page: T,
        field: K,
        lang: 'fa' | 'ar' | 'en',
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [field]: {
                    ...(prev[page][field] as object),
                    [lang]: value
                }
            }
        }));
    };

    const handleFooterColumnChange = (colIndex: number, lang: 'fa' | 'ar' | 'en', value: string) => {
        setFormData(prev => {
            const newColumns = [...prev.footer.columns];
            newColumns[colIndex] = {
                ...newColumns[colIndex],
                title: { ...newColumns[colIndex].title, [lang]: value }
            };
            return { ...prev, footer: { ...prev.footer, columns: newColumns } };
        });
    };

    const handleFooterLinkChange = (colIndex: number, linkIndex: number, field: 'url' | 'text', value: string, lang?: 'fa' | 'ar' | 'en') => {
        setFormData(prev => {
            const newColumns = [...prev.footer.columns];
            const newLinks = [...newColumns[colIndex].links];
            const oldLink = newLinks[linkIndex];
            
            if (field === 'text' && lang) {
                newLinks[linkIndex] = { ...oldLink, text: { ...oldLink.text, [lang]: value } };
            } else if (field === 'url') {
                newLinks[linkIndex] = { ...oldLink, url: value };
            }

            newColumns[colIndex] = { ...newColumns[colIndex], links: newLinks };
            return { ...prev, footer: { ...prev.footer, columns: newColumns } };
        });
    };

    const handleAddFooterLink = (colIndex: number) => {
        const newLink: FooterLink = {
            id: `link-${Date.now()}`,
            text: { fa: 'لینک جدید', ar: 'رابط جديد', en: 'New Link' },
            url: '/'
        };
        setFormData(prev => {
            const newColumns = [...prev.footer.columns];
            newColumns[colIndex] = { ...newColumns[colIndex], links: [...newColumns[colIndex].links, newLink] };
            return { ...prev, footer: { ...prev.footer, columns: newColumns } };
        });
    };

    const handleDeleteFooterLink = (colIndex: number, linkId: string) => {
        setFormData(prev => {
            const newColumns = [...prev.footer.columns];
            const filteredLinks = newColumns[colIndex].links.filter(link => link.id !== linkId);
            newColumns[colIndex] = { ...newColumns[colIndex], links: filteredLinks };
            return { ...prev, footer: { ...prev.footer, columns: newColumns } };
        });
    };

    const handlePopularDestinationsUpdate = (
        field: 'title' | 'subtitle',
        lang: 'fa' | 'ar' | 'en',
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            home: {
                ...prev.home,
                popularDestinations: {
                    ...prev.home.popularDestinations,
                    [field]: {
                        ...(prev.home.popularDestinations[field]),
                        [lang]: value,
                    },
                },
            },
        }));
    };

    const handleDestinationChange = (
        destId: string,
        field: 'name' | 'imageUrl',
        value: string,
        lang?: 'fa' | 'ar' | 'en'
    ) => {
        setFormData(prev => {
            const newDests = prev.home.popularDestinations.destinations.map(dest => {
                if (dest.id === destId) {
                    if (field === 'imageUrl') {
                        return { ...dest, imageUrl: value };
                    }
                    if (field === 'name' && lang) {
                        return { ...dest, name: { ...dest.name, [lang]: value } };
                    }
                }
                return dest;
            });
            return {
                ...prev,
                home: { ...prev.home,
                    popularDestinations: { ...prev.home.popularDestinations, destinations: newDests, },
                },
            };
        });
    };

    const handleAddDestination = () => {
        const newDestination: PopularDestination = {
            id: `dest-${Date.now()}`,
            name: { fa: 'شهر جدید', ar: 'مدينة جديدة', en: 'New City' },
            imageUrl: 'https://images.unsplash.com/photo-1549915239-a687f6a27a69?q=80&w=2535&auto=format&fit=crop',
        };
        setFormData(prev => ({ ...prev,
            home: { ...prev.home,
                popularDestinations: { ...prev.home.popularDestinations,
                    destinations: [...prev.home.popularDestinations.destinations, newDestination],
                },
            },
        }));
    };

    const handleDeleteDestination = (destId: string) => {
        setFormData(prev => ({ ...prev,
            home: { ...prev.home,
                popularDestinations: { ...prev.home.popularDestinations,
                    destinations: prev.home.popularDestinations.destinations.filter(
                        dest => dest.id !== destId
                    ),
                },
            },
        }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setFeedback(t('content.saveSuccess'));
        setTimeout(() => setFeedback(''), 3000);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('content.title')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('content.subtitle')}</p>
                </div>
                <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition">
                    {t('dashboard.general.save')}
                </button>
            </div>

            {feedback && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{feedback}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Home Page Section */}
                <section className="space-y-4 p-4 border rounded-lg md:col-span-2">
                    <h3 className="text-xl font-bold text-primary border-b pb-2">{t('content.home.title')}</h3>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('content.home.currentHeroImage')}</label>
                        <img src={formData.home.heroImageUrl} alt={t('content.home.heroImageAlt')} className="w-full h-48 object-cover rounded-lg mb-4 border" />
                    </div>
                    <div>
                        <label htmlFor="hero-image-upload" className="block text-sm font-medium text-slate-700 mb-1">{t('content.home.heroImageUrl')}</label>
                        <input
                            id="hero-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (loadEvent) => {
                                        handleUpdate('home', 'heroImageUrl', loadEvent.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="w-full text-sm text-slate-500
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-blue-50 file:text-primary
                                       hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="pt-4 border-t mt-4">
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">{t('dashboard.content.home.popularDestinations.title')}</h4>
                        <div className="space-y-4 p-3 border rounded-md bg-slate-50">
                            <LocalizedInput 
                                label={t('content.field.title')} 
                                value={formData.home.popularDestinations.title} 
                                onChange={(l, v) => handlePopularDestinationsUpdate('title', l, v)} 
                            />
                            <LocalizedTextarea
                                label={t('content.field.body')} 
                                value={formData.home.popularDestinations.subtitle} 
                                onChange={(l, v) => handlePopularDestinationsUpdate('subtitle', l, v)} 
                            />
                        </div>
                        
                        <div className="mt-4 space-y-3">
                            <h5 className="text-md font-semibold text-slate-600">{t('dashboard.content.home.popularDestinations.destinationsTitle')}</h5>
                            {formData.home.popularDestinations.destinations.map((dest, index) => (
                                <div key={dest.id} className="flex items-start gap-4 p-3 border bg-white rounded-md">
                                    <div className="flex-grow space-y-3">
                                        <p className="font-semibold text-slate-600">{t('dashboard.content.home.popularDestinations.destinationLabel', index + 1)}</p>
                                        <LocalizedInput 
                                            label={t('dashboard.content.home.popularDestinations.destinationName')}
                                            value={dest.name} 
                                            onChange={(l, v) => handleDestinationChange(dest.id, 'name', v, l)} 
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('dashboard.content.home.popularDestinations.destinationImageUrl')}</label>
                                            <input 
                                                type="text" 
                                                value={dest.imageUrl} 
                                                onChange={e => handleDestinationChange(dest.id, 'imageUrl', e.target.value)} 
                                                className="w-full p-2 border rounded text-sm ltr text-left"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleDeleteDestination(dest.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 transition mt-6">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <button type="button" onClick={handleAddDestination} className="mt-3 text-sm font-semibold text-primary hover:text-purple-800 flex items-center gap-1">
                            <PlusIcon className="w-4 h-4" />
                            <span>{t('dashboard.content.home.popularDestinations.addDestination')}</span>
                        </button>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-xl font-bold text-primary border-b pb-2">{t('about.title')}</h3>
                    <LocalizedInput label={t('content.field.title')} value={formData.about.title} onChange={(l, v) => handleLocalizedUpdate('about', 'title', l, v)} />
                    <LocalizedTextarea label={t('content.field.body')} value={formData.about.body} onChange={(l, v) => handleLocalizedUpdate('about', 'body', l, v)} />
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('content.field.imageUrl')}</label>
                        <input type="text" value={formData.about.imageUrl} onChange={e => handleUpdate('about', 'imageUrl', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                </section>
                
                {/* Contact Us Section */}
                <section className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-xl font-bold text-primary border-b pb-2">{t('contact.title')}</h3>
                    <LocalizedInput label={t('content.field.title')} value={formData.contact.title} onChange={(l, v) => handleLocalizedUpdate('contact', 'title', l, v)} />
                    <LocalizedTextarea label={t('content.field.body')} value={formData.contact.body} onChange={(l, v) => handleLocalizedUpdate('contact', 'body', l, v)} />
                    <LocalizedInput label={t('contact.address')} value={formData.contact.address} onChange={(l, v) => handleLocalizedUpdate('contact', 'address', l, v)} />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.phone')}</label>
                        <input type="text" value={formData.contact.phone} onChange={e => handleUpdate('contact', 'phone', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.email')}</label>
                        <input type="email" value={formData.contact.email} onChange={e => handleUpdate('contact', 'email', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('content.field.mapUrl')}</label>
                        <input type="text" value={formData.contact.mapImageUrl} onChange={e => handleUpdate('contact', 'mapImageUrl', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                </section>
            </div>
            
             {/* Footer Section */}
            <section className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-xl font-bold text-primary border-b pb-2">{t('footer.managementTitle')}</h3>
                <LocalizedTextarea label={t('content.field.footerDescription')} value={formData.footer.description} onChange={(l, v) => handleLocalizedUpdate('footer', 'description', l, v)} />
                
                 <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-lg font-semibold text-slate-700">{t('dashboard.content.footerColumns.title')}</h4>
                    {formData.footer.columns.map((column, colIndex) => (
                        <div key={column.id} className="p-3 border rounded-md bg-slate-50 space-y-3">
                            <LocalizedInput label={`${t('dashboard.content.footerColumns.columnTitle')} ${colIndex + 1}`} value={column.title} onChange={(l, v) => handleFooterColumnChange(colIndex, l, v)} />
                            <div className="space-y-2">
                                {column.links.map((link, linkIndex) => (
                                    <div key={link.id} className="flex items-end gap-2 p-2 border bg-white rounded">
                                        <div className="flex-grow">
                                            <label className="text-xs font-medium">{t('dashboard.content.footerColumns.linkText')}</label>
                                            <input type="text" value={link.text.fa} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'text', e.target.value, 'fa')} placeholder="فارسی" className="w-full p-1 border rounded text-sm"/>
                                            <input type="text" value={link.text.ar} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'text', e.target.value, 'ar')} placeholder="العربية" className="w-full p-1 border rounded text-sm mt-1"/>
                                            <input type="text" value={link.text.en} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'text', e.target.value, 'en')} placeholder="English" className="w-full p-1 border rounded text-sm mt-1"/>
                                        </div>
                                        <div className="flex-grow">
                                            <label className="text-xs font-medium">{t('dashboard.content.footerColumns.linkUrl')}</label>
                                            <input type="text" value={link.url} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'url', e.target.value)} placeholder="/about or https://..." className="w-full p-1 border rounded text-sm ltr text-left"/>
                                        </div>
                                        <button type="button" onClick={() => handleDeleteFooterLink(colIndex, link.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 transition">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => handleAddFooterLink(colIndex)} className="text-sm font-semibold text-primary hover:text-purple-800 flex items-center gap-1">
                                <PlusIcon className="w-4 h-4" />
                                <span>{t('dashboard.content.footerColumns.addLink')}</span>
                            </button>
                        </div>
                    ))}
                    {/* TODO: Add button to create a new column */}
                </div>
            </section>
        </div>
    );
};
