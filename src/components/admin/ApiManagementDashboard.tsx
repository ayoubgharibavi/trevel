import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { apiService } from '../../services/apiService';

interface ApiManagement {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  isEnabled: boolean;
  balance?: number;
  currency: string;
  status: string;
  lastCheck?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiManagementDashboardProps {
  onApiUpdate?: () => void;
}

export const ApiManagementDashboard: React.FC<ApiManagementDashboardProps> = ({ onApiUpdate }) => {
  const [apis, setApis] = useState<ApiManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiManagement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [newApi, setNewApi] = useState({
    name: '',
    displayName: '',
    baseUrl: '',
    apiKey: '',
    currency: 'USD',
    isActive: true,
    isEnabled: true,
  });
  const { t } = useLocalization();

  // Load APIs on component mount
  useEffect(() => {
    loadApis();
  }, []);

  const loadApis = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/api/v1/api-management', 'GET');
      if (response.success) {
        setApis(response.data);
      } else {
        setError(response.error || 'Failed to load APIs');
      }
    } catch (error) {
      setError('Failed to load APIs');
      console.error('Error loading APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApiStatus = async (apiId: string) => {
    try {
      const response = await apiService.request(`/api/v1/api-management/${apiId}/toggle-status`, 'PUT');
      if (response.success) {
        await loadApis();
        onApiUpdate?.();
      } else {
        setError(response.error || 'Failed to toggle API status');
      }
    } catch (error) {
      setError('Failed to toggle API status');
      console.error('Error toggling API status:', error);
    }
  };

  const toggleApiEnabled = async (apiId: string) => {
    try {
      const response = await apiService.request(`/api/v1/api-management/${apiId}/toggle-enabled`, 'PUT');
      if (response.success) {
        await loadApis();
        onApiUpdate?.();
      } else {
        setError(response.error || 'Failed to toggle API enabled status');
      }
    } catch (error) {
      setError('Failed to toggle API enabled status');
      console.error('Error toggling API enabled:', error);
    }
  };

  const testApiConnection = async (apiId: string) => {
    try {
      const response = await apiService.request(`/api/v1/api-management/${apiId}/test-connection`, 'POST');
      setTestResults(prev => ({
        ...prev,
        [apiId]: response
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [apiId]: {
          success: false,
          message: 'Failed to test connection'
        }
      }));
      console.error('Error testing API connection:', error);
    }
  };

  const getApiBalance = async (apiId: string) => {
    try {
      const response = await apiService.request(`/api/v1/api-management/${apiId}/get-balance`, 'POST');
      if (response.success) {
        await loadApis(); // Refresh to show updated balance
      }
      setTestResults(prev => ({
        ...prev,
        [apiId]: response
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [apiId]: {
          success: false,
          message: 'Failed to get balance'
        }
      }));
      console.error('Error getting API balance:', error);
    }
  };

  const updateAllStatuses = async () => {
    try {
      const response = await apiService.request('/api/v1/api-management/update-all-statuses', 'POST');
      if (response.success) {
        await loadApis();
        onApiUpdate?.();
      } else {
        setError(response.error || 'Failed to update all API statuses');
      }
    } catch (error) {
      setError('Failed to update all API statuses');
      console.error('Error updating all API statuses:', error);
    }
  };

  const addNewApi = async () => {
    try {
      const response = await apiService.request('/api/v1/api-management', 'POST', newApi);
      if (response.success) {
        await loadApis();
        setShowAddModal(false);
        setNewApi({
          name: '',
          displayName: '',
          baseUrl: '',
          apiKey: '',
          currency: 'USD',
          isActive: true,
          isEnabled: true,
        });
        onApiUpdate?.();
      } else {
        setError(response.error || 'Failed to add new API');
      }
    } catch (error) {
      setError('Failed to add new API');
      console.error('Error adding new API:', error);
    }
  };

  const deleteApi = async (apiId: string) => {
    if (!confirm('آیا از حذف این API مطمئن هستید؟')) {
      return;
    }
    
    try {
      const response = await apiService.request(`/api/v1/api-management/${apiId}`, 'DELETE');
      if (response.success) {
        await loadApis();
        onApiUpdate?.();
      } else {
        setError(response.error || 'Failed to delete API');
      }
    } catch (error) {
      setError('Failed to delete API');
      console.error('Error deleting API:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'inactive':
        return '⚫';
      case 'error':
        return '🔴';
      case 'maintenance':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading APIs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">مدیریت API ها</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={updateAllStatuses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            به‌روزرسانی همه وضعیت‌ها
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            افزودن API جدید
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نام API
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                فعال/غیرفعال
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                شارژ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                آخرین بررسی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apis.length > 0 ? apis.map(api => (
              <tr key={api.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{api.displayName}</div>
                    <div className="text-sm text-gray-500">{api.name}</div>
                    <div className="text-xs text-gray-400">{api.baseUrl}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                    {getStatusIcon(api.status)} {api.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleApiStatus(api.id)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        api.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {api.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                    <button
                      onClick={() => toggleApiEnabled(api.id)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        api.isEnabled 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {api.isEnabled ? 'روشن' : 'خاموش'}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {api.balance !== null && api.balance !== undefined ? (
                    <span className="font-medium">
                      {api.balance.toLocaleString()} {api.currency}
                    </span>
                  ) : (
                    <span className="text-gray-400">نامشخص</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {api.lastCheck ? new Date(api.lastCheck).toLocaleString('fa-IR') : 'هرگز'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testApiConnection(api.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      تست اتصال
                    </button>
                    <button
                      onClick={() => getApiBalance(api.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      دریافت شارژ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApi(api);
                        setShowEditModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteApi(api.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  هیچ API ای یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">نتایج تست</h3>
          {Object.entries(testResults).map(([apiId, result]) => {
            const api = apis.find(a => a.id === apiId);
            return (
              <div key={apiId} className="mb-2 p-2 bg-white rounded border">
                <div className="font-medium text-sm">{api?.displayName}</div>
                <div className={`text-sm ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.message}
                </div>
                {result.data && (
                  <div className="text-xs text-gray-500 mt-1">
                    {JSON.stringify(result.data)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add API Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">افزودن API جدید</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام فنی</label>
                <input
                  type="text"
                  value={newApi.name}
                  onChange={(e) => setNewApi(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                  placeholder="مثال: my-api"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام نمایشی</label>
                <input
                  type="text"
                  value={newApi.displayName}
                  onChange={(e) => setNewApi(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                  placeholder="مثال: My API Service"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  value={newApi.baseUrl}
                  onChange={(e) => setNewApi(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key (اختیاری)</label>
                <input
                  type="password"
                  value={newApi.apiKey}
                  onChange={(e) => setNewApi(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                  placeholder="کلید API"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ارز</label>
                <select
                  value={newApi.currency}
                  onChange={(e) => setNewApi(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="IRR">IRR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newApi.isActive}
                    onChange={(e) => setNewApi(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  فعال
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newApi.isEnabled}
                    onChange={(e) => setNewApi(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    className="mr-2"
                  />
                  روشن
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={addNewApi}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

















