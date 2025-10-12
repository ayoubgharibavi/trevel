import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, PlaneIcon, CalendarIcon } from './icons';

interface SuspendedBooking {
  id: string;
  status: string;
  totalPrice: number;
  bookingDate: string;
  passengersData: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  flight: {
    id: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    departureAirport: {
      name: string;
      code: string;
    };
    arrivalAirport: {
      name: string;
      code: string;
    };
    airlineInfo: {
      name: string;
    };
  };
  walletBlocks: Array<{
    id: string;
    amount: string;
    reason: string;
    createdAt: string;
  }>;
}

export const SuspendedBookingsDashboard: React.FC = () => {
  const { t, formatNumber, formatDate, formatTime } = useLocalization();
  const [suspendedBookings, setSuspendedBookings] = useState<SuspendedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    loadSuspendedBookings();
  }, []);

  const loadSuspendedBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuspendedBookings();
      if (response.success) {
        setSuspendedBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading suspended bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (blockId: string) => {
    try {
      setProcessing(blockId);
      const response = await apiService.confirmSuspendedBooking(blockId);
      if (response.success) {
        alert('رزرو با موفقیت تایید شد و مبلغ از کیف پول کسر شد');
        loadSuspendedBookings();
      } else {
        alert(`خطا در تایید رزرو: ${response.message}`);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('خطا در تایید رزرو');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectBooking = async (blockId: string) => {
    try {
      setProcessing(blockId);
      const response = await apiService.rejectSuspendedBooking(blockId, rejectReason);
      if (response.success) {
        alert('رزرو رد شد و مبلغ به کیف پول برگشت');
        setShowRejectModal(null);
        setRejectReason('');
        loadSuspendedBookings();
      } else {
        alert(`خطا در رد رزرو: ${response.message}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('خطا در رد رزرو');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUSPENDED_PAYMENT_BLOCKED':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUSPENDED_PAYMENT_BLOCKED':
        return 'معلق - مبلغ بلوکه شده';
      case 'SUSPENDED':
        return 'معلق';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">رزروهای معلق</h2>
            <p className="text-gray-600 mt-1">مدیریت رزروهای سپهر که منتظر تایید هستند</p>
          </div>
          <button
            onClick={loadSuspendedBookings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بروزرسانی
          </button>
        </div>

        {suspendedBookings.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">رزرو معلقی وجود ندارد</h3>
            <p className="mt-1 text-sm text-gray-500">همه رزروها تایید شده‌اند</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suspendedBookings.map((booking) => {
              const walletBlock = booking.walletBlocks[0];
              const passengers = JSON.parse(booking.passengersData || '[]');
              
              return (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className="text-sm text-gray-500">#{booking.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">مسافر:</span>
                            <span className="text-sm">{booking.user.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PlaneIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">پرواز:</span>
                            <span className="text-sm">{booking.flight.flightNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">مسیر:</span>
                            <span className="text-sm">
                              {booking.flight.departureAirport.name} → {booking.flight.arrivalAirport.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">تاریخ رزرو:</span>
                            <span className="text-sm">{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">تعداد مسافران:</span>
                            <span className="text-sm">{passengers.length} نفر</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">مبلغ:</span>
                            <span className="text-sm font-bold text-green-600">
                              {formatNumber(booking.totalPrice)} تومان
                            </span>
                          </div>
                        </div>
                      </div>

                      {walletBlock && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <ClockIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">مبلغ بلوکه شده</span>
                          </div>
                          <div className="text-sm text-yellow-700">
                            مبلغ: {formatNumber(Number(walletBlock.amount))} تومان
                          </div>
                          <div className="text-xs text-yellow-600 mt-1">
                            تاریخ بلوکه: {formatDate(walletBlock.createdAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleConfirmBooking(walletBlock?.id || '')}
                        disabled={processing === walletBlock?.id}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        {processing === walletBlock?.id ? 'در حال تایید...' : 'تایید'}
                      </button>
                      
                      <button
                        onClick={() => setShowRejectModal(walletBlock?.id || '')}
                        disabled={processing === walletBlock?.id}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        رد
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">رد رزرو</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دلیل رد رزرو
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="دلیل رد رزرو را وارد کنید..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleRejectBooking(showRejectModal)}
                disabled={processing === showRejectModal}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing === showRejectModal ? 'در حال رد...' : 'رد رزرو'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

