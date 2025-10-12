import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SuspendedBookingsDashboard } from './SuspendedBookingsDashboard';
import SepehrCreditStatus from './SepehrCreditStatus';

type AdminView = 
  | 'dashboard'
  | 'users'
  | 'flights'
  | 'bookings'
  | 'suspended-bookings'
  | 'tickets'
  | 'refunds'
  | 'tenants'
  | 'advertisements'
  | 'content'
  | 'api-management'
  | 'accounting'
  | 'loading-settings'
  | 'permissions'
  | 'activity-log'
  | 'charter118'
  | 'sepehr-bookings'
  | 'sepehr-credit'
  | 'telegram-bot'
  | 'whatsapp-bot';

export const AdminPanel: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'suspended-bookings':
        return <SuspendedBookingsDashboard />;
      case 'sepehr-credit':
        return <SepehrCreditStatus />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">پنل مدیریت</h2>
            <p className="text-gray-600">لطفاً بخش مورد نظر را از منوی کناری انتخاب کنید.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};