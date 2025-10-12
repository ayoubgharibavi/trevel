import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface Booking {
  id: string;
  userId: string;
  flightId: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  contactEmail: string;
  contactPhone: string;
  passengersData: string;
  notes: string;
  bookingDate: string;
  flight?: {
    flightNumber: string;
    departureAirport?: { city: string; code: string };
    arrivalAirport?: { city: string; code: string };
    departureTime: string;
    arrivalTime: string;
    airlineInfo?: { name: string };
  };
  user?: {
    name: string;
    email: string;
  };
  passengersInfo?: Array<{
    firstName: string;
    lastName: string;
    gender: string;
    nationality: string;
  }>;
}

const AdminBookingManagement: React.FC = () => {
  const { t } = useLocalization();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('خطا در دریافت لیست رزروها');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/v1/admin/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update booking status in local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: action === 'confirm' ? 'CONFIRMED' : 'REJECTED' }
            : booking
        ));

        setShowModal(false);
        setSelectedBooking(null);
        setAdminNotes('');
        
        alert(`رزرو ${action === 'confirm' ? 'تأیید' : 'رد'} شد`);
      } else {
        const error = await response.json();
        alert(`خطا: ${error.message || 'عملیات ناموفق بود'}`);
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTicketAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/v1/bookings/ticket-${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        alert(`تیکت ${action === 'approve' ? 'تأیید' : 'رد'} شد`);
        
        // Refresh bookings to get updated ticket status
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`خطا: ${error.message || 'عملیات ناموفق بود'}`);
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setAdminNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار';
      case 'CONFIRMED': return 'تأیید شده';
      case 'CANCELLED': return 'لغو شده';
      case 'REJECTED': return 'رد شده';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت رزروها</h1>
        <button
          onClick={fetchBookings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          🔄 بروزرسانی
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-2">❌</div>
            <div>
              <h3 className="font-semibold text-red-800">خطا</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره رزرو
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مسافر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  پرواز
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  قیمت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تأیید/رد تیکت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ رزرو
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{booking.user?.name || 'نامشخص'}</div>
                      <div className="text-gray-500">{booking.contactEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{booking.flight?.flightNumber || 'نامشخص'}</div>
                      <div className="text-gray-500">
                        {booking.flight?.departureAirport?.city} → {booking.flight?.arrivalAirport?.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.totalPrice ? Math.round(booking.totalPrice / 10).toLocaleString() : 'نامشخص'} تومان
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-y-2">
                      {/* Ticket Status */}
                      <div className="text-xs text-gray-500">
                        تیکت: {booking.tickets && booking.tickets.length > 0 
                          ? booking.tickets[0].status === 'CLOSED' ? '✅ تأیید شده' 
                          : booking.tickets[0].status === 'CANCELLED' ? '❌ رد شده'
                          : '⏳ در انتظار'
                          : '❌ تیکت ندارد'}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTicketAction(booking.id, 'approve')}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded text-xs"
                          disabled={actionLoading}
                        >
                          ✓ تأیید تیکت
                        </button>
                        <button
                          onClick={() => handleTicketAction(booking.id, 'reject')}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-xs"
                          disabled={actionLoading}
                        >
                          ✗ رد تیکت
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.bookingDate).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        جزئیات
                      </button>
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            className="text-green-600 hover:text-green-900"
                            disabled={actionLoading}
                          >
                            تأیید
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            disabled={actionLoading}
                          >
                            رد
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">هیچ رزروی یافت نشد</div>
          </div>
        )}
      </div>

      {/* Modal for booking details */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">جزئیات رزرو</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">شماره رزرو</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedBooking.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">وضعیت</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">اطلاعات پرواز</label>
                <div className="mt-1 text-sm text-gray-900">
                  {selectedBooking.flight?.flightNumber} - {selectedBooking.flight?.airlineInfo?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedBooking.flight?.departureAirport?.city} → {selectedBooking.flight?.arrivalAirport?.city}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">مسافران</label>
                <div className="mt-1">
                  {selectedBooking.passengersInfo?.map((passenger, index) => (
                    <div key={index} className="text-sm text-gray-900">
                      {passenger.firstName} {passenger.lastName} ({passenger.gender === 'MALE' ? 'آقا' : 'خانم'})
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">اطلاعات تماس</label>
                <div className="mt-1 text-sm text-gray-900">
                  <div>ایمیل: {selectedBooking.contactEmail}</div>
                  <div>تلفن: {selectedBooking.contactPhone}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">قیمت</label>
                <div className="mt-1 text-sm text-gray-900">
                  {selectedBooking.totalPrice ? Math.round(selectedBooking.totalPrice / 10).toLocaleString() : 'نامشخص'} تومان
                </div>
              </div>

              {selectedBooking.status === 'PENDING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت ادمین</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="یادداشت اختیاری..."
                  />
                </div>
              )}
            </div>

            {selectedBooking.status === 'PENDING' && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleBookingAction(selectedBooking.id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  رد رزرو
                </button>
                <button
                  onClick={() => handleBookingAction(selectedBooking.id, 'confirm')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  تأیید رزرو
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;