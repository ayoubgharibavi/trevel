import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  commissionType: 'PERCENTAGE' | 'FIXED';
  parentCommissionRate: number;
  subdomain: string | null;
  customDomain: string | null;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  isActive: boolean;
  isWhiteLabel: boolean;
  parentTenantId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const SubTenantsPanel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'subdomains' | 'custom'>('main');
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    contactPhone: '',
    commissionRate: 0,
    commissionType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    parentCommissionRate: 0,
    subdomain: '',
    customDomain: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    logo: '',
    isActive: true,
    isWhiteLabel: false
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await apiService.getTenants();
      if (response.success) {
        setTenants(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    switch (activeTab) {
      case 'main':
        return !tenant.isWhiteLabel || (!tenant.subdomain && !tenant.customDomain);
      case 'subdomains':
        return tenant.isWhiteLabel && tenant.subdomain && !tenant.customDomain;
      case 'custom':
        return tenant.isWhiteLabel && tenant.customDomain;
      default:
        return true;
    }
  });

  const handleCreateTenant = async () => {
    try {
      setIsLoading(true);
      
      const tenantData = {
        ...newTenant,
        isWhiteLabel: activeTab !== 'main',
        subdomain: activeTab === 'subdomains' ? newTenant.subdomain : null,
        customDomain: activeTab === 'custom' ? newTenant.customDomain : null,
      };
      
      const response = await apiService.createTenant(tenantData);
      if (response.success) {
        setNewTenant({
          name: '',
          slug: '',
          contactEmail: '',
          contactPhone: '',
          commissionRate: 0,
          commissionType: 'PERCENTAGE',
          parentCommissionRate: 0,
          subdomain: '',
          customDomain: '',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          logo: '',
          isActive: true,
          isWhiteLabel: false
        });
        setShowCreateForm(false);
        await loadTenants();
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setNewTenant({
      name: tenant.name,
      slug: tenant.slug,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      commissionRate: tenant.commissionRate,
      commissionType: tenant.commissionType || 'PERCENTAGE',
      parentCommissionRate: tenant.parentCommissionRate,
      subdomain: tenant.subdomain || '',
      customDomain: tenant.customDomain || '',
      primaryColor: tenant.primaryColor || '#3B82F6',
      secondaryColor: tenant.secondaryColor || '#1E40AF',
      logo: tenant.logo || '',
      isActive: tenant.isActive,
      isWhiteLabel: tenant.isWhiteLabel
    });
    setShowEditForm(true);
  };

  const updateTenant = async () => {
    if (!editingTenant) return;
    
    try {
      const response = await apiService.updateTenant(editingTenant.id, newTenant);
      if (response.success) {
        setShowEditForm(false);
        setEditingTenant(null);
        setNewTenant({
          name: '',
          slug: '',
          contactEmail: '',
          contactPhone: '',
          commissionRate: 0,
          commissionType: 'PERCENTAGE',
          parentCommissionRate: 0,
          subdomain: '',
          customDomain: '',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          logo: '',
          isActive: true,
          isWhiteLabel: false
        });
        await loadTenants();
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این زیرمجموعه را حذف کنید؟')) {
      return;
    }
    
    try {
      await apiService.deleteTenant(tenantId);
      await loadTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت زیرمجموعه‌ها</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          افزودن زیرمجموعه
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('main')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'main'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            آژانس‌های اصلی ({tenants.filter(t => !t.isWhiteLabel || (!t.subdomain && !t.customDomain)).length})
          </button>
          <button
            onClick={() => setActiveTab('subdomains')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subdomains'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            زیردامنه‌ها ({tenants.filter(t => t.isWhiteLabel && t.subdomain && !t.customDomain).length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'custom'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            دامنه‌های اختصاصی ({tenants.filter(t => t.isWhiteLabel && t.customDomain).length})
          </button>
        </nav>
      </div>

      {/* Create Tenant Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {activeTab === 'main' ? 'افزودن آژانس جدید' : 
               activeTab === 'subdomains' ? 'افزودن زیردامنه جدید' : 
               'افزودن دامنه اختصاصی جدید'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">نام</label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">اسلاگ</label>
                <input
                  type="text"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ایمیل</label>
                <input
                  type="email"
                  value={newTenant.contactEmail}
                  onChange={(e) => setNewTenant({ ...newTenant, contactEmail: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">تلفن</label>
                <input
                  type="text"
                  value={newTenant.contactPhone}
                  onChange={(e) => setNewTenant({ ...newTenant, contactPhone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">نرخ کمیسیون</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={newTenant.commissionRate || 0}
                    onChange={(e) => setNewTenant({ ...newTenant, commissionRate: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <select
                    value={newTenant.commissionType || 'PERCENTAGE'}
                    onChange={(e) => setNewTenant({ ...newTenant, commissionType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    className="mt-1 block border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="PERCENTAGE">%</option>
                    <option value="FIXED">تومان</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">نرخ کمیسیون والد</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTenant.parentCommissionRate}
                  onChange={(e) => setNewTenant({ ...newTenant, parentCommissionRate: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              {activeTab === 'subdomains' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ساب‌دامین</label>
                  <input
                    type="text"
                    value={newTenant.subdomain || ''}
                    onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                    placeholder="مثال: tehran-agency"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              )}
              {activeTab === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">دامنه اختصاصی</label>
                  <input
                    type="text"
                    value={newTenant.customDomain || ''}
                    onChange={(e) => setNewTenant({ ...newTenant, customDomain: e.target.value })}
                    placeholder="مثال: my-agency.ir"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">رنگ اصلی</label>
                <input
                  type="color"
                  value={newTenant.primaryColor}
                  onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">رنگ ثانویه</label>
                <input
                  type="color"
                  value={newTenant.secondaryColor}
                  onChange={(e) => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateTenant}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {activeTab === 'main' ? 'ایجاد آژانس' : 
                 activeTab === 'subdomains' ? 'ایجاد زیردامنه' : 
                 'ایجاد دامنه اختصاصی'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Form */}
      {showEditForm && editingTenant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ویرایش آژانس</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">نام</label>
                  <input
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">اسلاگ</label>
                  <input
                    type="text"
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ایمیل</label>
                  <input
                    type="email"
                    value={newTenant.contactEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, contactEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تلفن</label>
                  <input
                    type="text"
                    value={newTenant.contactPhone}
                    onChange={(e) => setNewTenant({ ...newTenant, contactPhone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">نرخ کمیسیون</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={newTenant.commissionRate}
                      onChange={(e) => setNewTenant({ ...newTenant, commissionRate: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <select
                      value={newTenant.commissionType || 'PERCENTAGE'}
                      onChange={(e) => setNewTenant({ ...newTenant, commissionType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                      className="mt-1 block border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">تومان</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">نرخ کمیسیون والد</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTenant.parentCommissionRate}
                    onChange={(e) => setNewTenant({ ...newTenant, parentCommissionRate: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">زیردامنه</label>
                  <input
                    type="text"
                    value={newTenant.subdomain || ''}
                    onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                    placeholder="مثال: tehran-agency"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">دامنه اختصاصی</label>
                  <input
                    type="text"
                    value={newTenant.customDomain || ''}
                    onChange={(e) => setNewTenant({ ...newTenant, customDomain: e.target.value })}
                    placeholder="مثال: my-agency.ir"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">رنگ اصلی</label>
                  <input
                    type="color"
                    value={newTenant.primaryColor}
                    onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">رنگ ثانویه</label>
                  <input
                    type="color"
                    value={newTenant.secondaryColor}
                    onChange={(e) => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  onClick={updateTenant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  به‌روزرسانی
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenants List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">لیست زیرمجموعه‌ها</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسلاگ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ایمیل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تلفن
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کمیسیون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  لینک دسترسی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tenant.name}
                    {tenant.isWhiteLabel && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        White Label
                      </span>
                    )}
                    {tenant.parentTenantId && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        (Sub-tenant)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.contactEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.contactPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.commissionRate}
                    {tenant.commissionType === 'PERCENTAGE' ? '%' : ' تومان'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.customDomain ? (
                      <a href={`https://${tenant.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {tenant.customDomain}
                      </a>
                    ) : tenant.subdomain ? (
                      <a href={`https://${tenant.subdomain}.trevel.com`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                        {tenant.subdomain}.trevel.com
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => editTenant(tenant)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteTenant(tenant.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTenants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {activeTab === 'main' ? 'هیچ آژانس اصلی وجود ندارد' :
             activeTab === 'subdomains' ? 'هیچ زیردامنه وجود ندارد' :
             'هیچ دامنه اختصاصی وجود ندارد'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubTenantsPanel;