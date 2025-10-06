import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { PlusIcon } from '../icons/PlusIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ToggleOnIcon } from '../icons/ToggleOnIcon';
import { ToggleOffIcon } from '../icons/ToggleOffIcon';

interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  position: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface AdvertisementFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  position: string;
  priority: number;
  isActive: boolean;
}

export const AdvertisementManagement: React.FC = () => {
  const { t } = useLocalization();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdvertisementFormData>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    position: 'flight-results',
    priority: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/api/v1/advertisements');
      setAdvertisements(response || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      // Mock data for demonstration
      setAdvertisements([
        {
          id: '1',
          title: 'پروازهای ارزان به مشهد',
          description: 'بهترین قیمت‌ها برای سفر به مشهد',
          imageUrl: '/images/ads/mashhad-ad.jpg',
          linkUrl: '/flights?to=mashhad',
          backgroundColor: '#f0f9ff',
          textColor: '#1e40af',
          isActive: true,
          position: 'homepage',
          priority: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'تخفیف ویژه استانبول',
          description: 'سفر به استانبول با ۲۰٪ تخفیف',
          imageUrl: '/images/ads/istanbul-ad.jpg',
          linkUrl: '/flights?to=istanbul',
          backgroundColor: '#fef3c7',
          textColor: '#92400e',
          isActive: false,
          position: 'sidebar',
          priority: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await apiService.put(`/api/v1/advertisements/${editingAd.id}`, formData);
      } else {
        await apiService.post('/api/v1/advertisements', formData);
      }
      await fetchAdvertisements();
      setIsModalOpen(false);
      setEditingAd(null);
      resetForm();
    } catch (error) {
      console.error('Error saving advertisement:', error);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      backgroundColor: ad.backgroundColor || '#ffffff',
      textColor: ad.textColor || '#000000',
      position: ad.position,
      priority: ad.priority,
      isActive: ad.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این تبلیغ را حذف کنید؟')) {
      try {
        await apiService.delete(`/api/v1/advertisements/${id}`);
        await fetchAdvertisements();
      } catch (error) {
        console.error('Error deleting advertisement:', error);
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiService.put(`/api/v1/advertisements/${id}`, { isActive: !currentStatus });
      await fetchAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      position: 'flight-results',
      priority: 1,
      isActive: true,
    });
  };

  const openModal = () => {
    setEditingAd(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
    resetForm();
  };

  const positionOptions = [
    { value: 'homepage', label: 'صفحه اصلی' },
    { value: 'flight-results', label: 'نتایج جستجو' },
    { value: 'sidebar', label: 'نوار کناری' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">مدیریت تبلیغات</h2>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>تبلیغ جدید</span>
        </button>
      </div>

      {/* Advertisements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Ad Preview */}
            <div 
              className="h-32 flex items-center justify-center text-white font-bold text-lg"
              style={{ 
                backgroundColor: ad.backgroundColor,
                color: ad.textColor 
              }}
            >
              {ad.title}
            </div>
            
            {/* Ad Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{ad.title}</h3>
              {ad.description && (
                <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>موقعیت:</span>
                  <span>{positionOptions.find(p => p.value === ad.position)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>اولویت:</span>
                  <span>{ad.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span>وضعیت:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ad.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ad.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(ad)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="ویرایش"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(ad.id, ad.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    ad.isActive 
                      ? 'text-orange-600 hover:bg-orange-100' 
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                  title={ad.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                >
                  {ad.isActive ? <ToggleOffIcon className="w-4 h-4" /> : <ToggleOnIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="حذف"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {advertisements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ تبلیغی وجود ندارد</h3>
          <p className="text-gray-500 mb-4">برای شروع، تبلیغ جدیدی ایجاد کنید</p>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ایجاد تبلیغ جدید
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAd ? 'ویرایش تبلیغ' : 'تبلیغ جدید'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان تبلیغ
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    موقعیت نمایش
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    آدرس تصویر
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    لینک مقصد
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رنگ پس‌زمینه
                  </label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رنگ متن
                  </label>
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اولویت
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  تبلیغ فعال است
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAd ? 'به‌روزرسانی' : 'ایجاد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

















