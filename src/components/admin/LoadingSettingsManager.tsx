import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { CogIcon } from '../icons/CogIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';

interface LoadingSettings {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  timeout: number;
  retryCount: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface LoadingSettingsFormData {
  name: string;
  description: string;
  isEnabled: boolean;
  timeout: number;
  retryCount: number;
  priority: number;
}

const LoadingSettingsManager: React.FC = () => {
  const { t } = useLocalization();
  const [settings, setSettings] = useState<LoadingSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<LoadingSettings | null>(null);
  const [formData, setFormData] = useState<LoadingSettingsFormData>({
    name: '',
    description: '',
    isEnabled: true,
    timeout: 5000,
    retryCount: 3,
    priority: 1,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/api/v1/admin/loading-settings');
      // Handle the API response structure: { success: true, data: settings }
      if (response && response.success && Array.isArray(response.data)) {
        setSettings(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setSettings(response);
      } else {
        setSettings([]);
      }
    } catch (error) {
      console.error('Error fetching loading settings:', error);
      // Mock data for demonstration
      setSettings([
        {
          id: '1',
          name: 'Flight Search Loading',
          description: 'تنظیمات بارگذاری برای جستجوی پروازها',
          isEnabled: true,
          timeout: 10000,
          retryCount: 3,
          priority: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Booking Process Loading',
          description: 'تنظیمات بارگذاری برای فرآیند رزرو',
          isEnabled: true,
          timeout: 15000,
          retryCount: 5,
          priority: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Payment Gateway Loading',
          description: 'تنظیمات بارگذاری برای درگاه پرداخت',
          isEnabled: false,
          timeout: 20000,
          retryCount: 2,
          priority: 3,
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
      if (editingSetting) {
        const response = await apiService.put(`/api/v1/admin/loading-settings/${editingSetting.id}`, formData);
        if (!response.success) {
          console.error('Error updating loading settings:', response.error);
          return;
        }
      } else {
        const response = await apiService.post('/api/v1/admin/loading-settings', formData);
        if (!response.success) {
          console.error('Error creating loading settings:', response.error);
          return;
        }
      }
      await fetchSettings();
      setIsModalOpen(false);
      setEditingSetting(null);
      resetForm();
    } catch (error) {
      console.error('Error saving loading settings:', error);
    }
  };

  const handleEdit = (setting: LoadingSettings) => {
    setEditingSetting(setting);
    setFormData({
      name: setting.name,
      description: setting.description,
      isEnabled: setting.isEnabled,
      timeout: setting.timeout,
      retryCount: setting.retryCount,
      priority: setting.priority,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این تنظیمات را حذف کنید؟')) {
      try {
        const response = await apiService.delete(`/api/v1/admin/loading-settings/${id}`);
        if (!response.success) {
          console.error('Error deleting loading settings:', response.error);
          return;
        }
        await fetchSettings();
      } catch (error) {
        console.error('Error deleting loading settings:', error);
      }
    }
  };

  const toggleEnabled = async (id: string, currentStatus: boolean) => {
    try {
      const response = await apiService.put(`/api/v1/admin/loading-settings/${id}/toggle-enabled`);
      if (!response.success) {
        console.error('Error toggling loading settings status:', response.error);
        return;
      }
      await fetchSettings();
    } catch (error) {
      console.error('Error toggling loading settings status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isEnabled: true,
      timeout: 5000,
      retryCount: 3,
      priority: 1,
    });
  };

  const openModal = () => {
    setEditingSetting(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSetting(null);
    resetForm();
  };

  const formatTimeout = (timeout: number) => {
    if (timeout >= 1000) {
      return `${timeout / 1000}s`;
    }
    return `${timeout}ms`;
  };

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
        <div className="flex items-center space-x-3">
          <CogIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مدیریت تنظیمات بارگذاری</h2>
            <p className="text-gray-600">تنظیمات مربوط به زمان‌بندی و بارگذاری سیستم</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CogIcon className="w-5 h-5" />
          <span>تنظیمات جدید</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(settings) && settings.map((setting) => (
          <div key={setting.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{setting.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  setting.isEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {setting.isEnabled ? 'فعال' : 'غیرفعال'}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
            </div>
            
            {/* Settings Details */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">زمان انتظار:</span>
                  <div className="font-medium text-gray-900">{formatTimeout(setting.timeout)}</div>
                </div>
                <div>
                  <span className="text-gray-500">تعداد تلاش:</span>
                  <div className="font-medium text-gray-900">{setting.retryCount}</div>
                </div>
                <div>
                  <span className="text-gray-500">اولویت:</span>
                  <div className="font-medium text-gray-900">{setting.priority}</div>
                </div>
                <div>
                  <span className="text-gray-500">وضعیت:</span>
                  <div className={`font-medium ${
                    setting.isEnabled ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {setting.isEnabled ? 'فعال' : 'غیرفعال'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(setting)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="ویرایش"
                >
                  <CogIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleEnabled(setting.id, setting.isEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.isEnabled 
                      ? 'text-orange-600 hover:bg-orange-100' 
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                  title={setting.isEnabled ? 'غیرفعال کردن' : 'فعال کردن'}
                >
                  {setting.isEnabled ? <XIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(setting.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="حذف"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!Array.isArray(settings) || settings.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CogIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ تنظیماتی وجود ندارد</h3>
          <p className="text-gray-500 mb-4">برای شروع، تنظیمات جدیدی ایجاد کنید</p>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ایجاد تنظیمات جدید
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingSetting ? 'ویرایش تنظیمات بارگذاری' : 'تنظیمات بارگذاری جدید'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام تنظیمات
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                    زمان انتظار (میلی‌ثانیه)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="60000"
                    step="1000"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    پیشنهادی: 5000-15000 میلی‌ثانیه
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تعداد تلاش مجدد
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.retryCount}
                    onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    پیشنهادی: 3-5 تلاش
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isEnabled" className="ml-2 text-sm text-gray-700">
                  تنظیمات فعال است
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
                  {editingSetting ? 'به‌روزرسانی' : 'ایجاد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSettingsManager;



















