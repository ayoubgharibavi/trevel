import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { apiService } from '../services/apiService';
import { CurrencyDisplay } from './CurrencyDisplay';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRateToUSD: number;
  isBaseCurrency: boolean;
  isActive: boolean;
}

interface ExchangeRate {
  id: string;
  baseCurrencyId: string;
  targetCurrencyId: string;
  rate: number;
  lastUpdated: string;
  source: string;
  isActive: boolean;
  baseCurrency: Currency;
  targetCurrency: Currency;
}

interface CreateExchangeRateData {
  baseCurrencyId: string;
  targetCurrencyId: string;
  rate: number;
  source?: string;
}

interface UpdateExchangeRateData {
  rate: number;
  source?: string;
}

export const ExchangeRatesDashboard: React.FC = () => {
  const { t } = useLocalization();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [formData, setFormData] = useState<CreateExchangeRateData>({
    baseCurrencyId: '',
    targetCurrencyId: '',
    rate: 0,
    source: 'MANUAL',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ratesResponse, currenciesResponse] = await Promise.all([
        apiService.get<ExchangeRate[]>('/api/v1/exchange-rates'),
        apiService.get<Currency[]>('/api/v1/exchange-rates/currencies'),
      ]);
      
      if (ratesResponse.success && ratesResponse.data) {
        setExchangeRates(ratesResponse.data);
      }
      
      if (currenciesResponse.success && currenciesResponse.data) {
        setCurrencies(currenciesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if exchange rate already exists for this currency pair
    const existingRate = exchangeRates.find(rate => 
      rate.baseCurrencyId === formData.baseCurrencyId && 
      rate.targetCurrencyId === formData.targetCurrencyId
    );
    
    if (existingRate) {
      alert('نرخ تبدیل ارز برای این جفت ارز قبلاً وجود دارد. لطفاً از گزینه ویرایش استفاده کنید.');
      return;
    }
    
    try {
      const response = await apiService.post('/api/v1/exchange-rates', formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({ baseCurrencyId: '', targetCurrencyId: '', rate: 0, source: 'MANUAL' });
        fetchData();
        alert('نرخ تبدیل ارز با موفقیت ایجاد شد');
      } else {
        alert(response.error || 'خطا در ایجاد نرخ تبدیل ارز');
      }
    } catch (error: any) {
      console.error('Error creating exchange rate:', error);
      alert(error.message || 'خطا در ایجاد نرخ تبدیل ارز');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    
    try {
      const updateData: UpdateExchangeRateData = {
        rate: formData.rate,
        source: formData.source,
      };
      const response = await apiService.put(`/api/v1/exchange-rates/${editingRate.id}`, updateData);
      if (response.success) {
        setEditingRate(null);
        // Don't reset formData here - let openEditModal handle it
        fetchData();
        alert('نرخ تبدیل ارز با موفقیت به‌روزرسانی شد');
      } else {
        alert(response.error || 'خطا در به‌روزرسانی نرخ تبدیل ارز');
      }
    } catch (error: any) {
      console.error('Error updating exchange rate:', error);
      alert(error.message || 'خطا در به‌روزرسانی نرخ تبدیل ارز');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این نرخ تبدیل ارز اطمینان دارید؟')) return;
    
    try {
      const response = await apiService.delete(`/api/v1/exchange-rates/${id}`);
      if (response.success) {
        fetchData();
        alert('نرخ تبدیل ارز با موفقیت حذف شد');
      } else {
        alert(response.error || 'خطا در حذف نرخ تبدیل ارز');
      }
    } catch (error: any) {
      console.error('Error deleting exchange rate:', error);
      alert(error.message || 'خطا در حذف نرخ تبدیل ارز');
    }
  };

  const openEditModal = (rate: ExchangeRate) => {
    console.log('Opening edit modal for rate:', rate);
    setEditingRate(rate);
    setFormData({
      baseCurrencyId: rate.baseCurrencyId,
      targetCurrencyId: rate.targetCurrencyId,
      rate: rate.rate,
      source: rate.source || 'MANUAL',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نرخ تبدیل ارز</h1>
          <p className="text-gray-600 mt-1">مدیریت نرخ‌های تبدیل ارز</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshIcon className="w-4 h-4" />
            <span>به‌روزرسانی</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>افزودن نرخ جدید</span>
          </button>
        </div>
      </div>

      {/* Exchange Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ارز مبدأ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ارز مقصد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نرخ تبدیل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخرین به‌روزرسانی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  منبع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exchangeRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {rate.baseCurrency.code}
                      </span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({(() => {
                          let displayName = rate.baseCurrency.name;
                          if (typeof rate.baseCurrency.name === 'string') {
                            try {
                              const parsed = JSON.parse(rate.baseCurrency.name);
                              displayName = parsed.fa || parsed.en || rate.baseCurrency.name;
                            } catch {
                              displayName = rate.baseCurrency.name;
                            }
                          }
                          return displayName;
                        })()})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {rate.targetCurrency.code}
                      </span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({(() => {
                          let displayName = rate.targetCurrency.name;
                          if (typeof rate.targetCurrency.name === 'string') {
                            try {
                              const parsed = JSON.parse(rate.targetCurrency.name);
                              displayName = parsed.fa || parsed.en || rate.targetCurrency.name;
                            } catch {
                              displayName = rate.targetCurrency.name;
                            }
                          }
                          return displayName;
                        })()})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {rate.rate.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      try {
                        // Handle different formats of lastUpdated
                        if (!rate.lastUpdated || typeof rate.lastUpdated === 'object' && Object.keys(rate.lastUpdated).length === 0) {
                          return 'نامشخص';
                        }
                        const date = new Date(rate.lastUpdated);
                        return isNaN(date.getTime()) ? 'نامشخص' : date.toLocaleDateString('fa-IR');
                      } catch {
                        return 'نامشخص';
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {rate.source || 'MANUAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => openEditModal(rate)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">افزودن نرخ تبدیل ارز جدید</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ارز مبدأ
                </label>
                <select
                  value={formData.baseCurrencyId}
                  onChange={(e) => setFormData({ ...formData, baseCurrencyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {currencies.map((currency) => {
                    // Parse currency name if it's a JSON string
                    let displayName = currency.name;
                    if (typeof currency.name === 'string') {
                      try {
                        const parsed = JSON.parse(currency.name);
                        displayName = parsed.fa || parsed.en || currency.name;
                      } catch {
                        displayName = currency.name;
                      }
                    }
                    return (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ارز مقصد
                </label>
                <select
                  value={formData.targetCurrencyId}
                  onChange={(e) => setFormData({ ...formData, targetCurrencyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {currencies.map((currency) => {
                    // Parse currency name if it's a JSON string
                    let displayName = currency.name;
                    if (typeof currency.name === 'string') {
                      try {
                        const parsed = JSON.parse(currency.name);
                        displayName = parsed.fa || parsed.en || currency.name;
                      } catch {
                        displayName = currency.name;
                      }
                    }
                    return (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نرخ تبدیل
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  منبع
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="MANUAL">دستی</option>
                  <option value="API">API</option>
                </select>
              </div>
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  ایجاد
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ویرایش نرخ تبدیل ارز</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ارز مبدأ
                </label>
                <input
                  type="text"
                  value={`${editingRate.baseCurrency.code} - ${(() => {
                    let displayName = editingRate.baseCurrency.name;
                    if (typeof editingRate.baseCurrency.name === 'string') {
                      try {
                        const parsed = JSON.parse(editingRate.baseCurrency.name);
                        displayName = parsed.fa || parsed.en || editingRate.baseCurrency.name;
                      } catch {
                        displayName = editingRate.baseCurrency.name;
                      }
                    }
                    return displayName;
                  })()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ارز مقصد
                </label>
                <input
                  type="text"
                  value={`${editingRate.targetCurrency.code} - ${(() => {
                    let displayName = editingRate.targetCurrency.name;
                    if (typeof editingRate.targetCurrency.name === 'string') {
                      try {
                        const parsed = JSON.parse(editingRate.targetCurrency.name);
                        displayName = parsed.fa || parsed.en || editingRate.targetCurrency.name;
                      } catch {
                        displayName = editingRate.targetCurrency.name;
                      }
                    }
                    return displayName;
                  })()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نرخ تبدیل
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  منبع
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="MANUAL">دستی</option>
                  <option value="API">API</option>
                </select>
              </div>
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  به‌روزرسانی
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

