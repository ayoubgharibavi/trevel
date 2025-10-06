import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';
import { InfoIcon } from '../icons/InfoIcon';

interface SepehrBooking {
  id: string;
  bookingId: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  currency: string;
  bookingDate: string;
  flightDetails: {
    from: string;
    to: string;
    departureDate: string;
    arrivalDate: string;
    airline: string;
    flightNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BookingFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

const SepehrBookingsManagement: React.FC = () => {
  const { t } = useLocalization();
  const [bookings, setBookings] = useState<SepehrBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<SepehrBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.searchTerm) queryParams.append('search', filters.searchTerm);

      const response = await apiService.get(`/api/v1/sepehr/bookings?${queryParams}`);
      setBookings(response || []);
    } catch (error) {
      console.error('Error fetching Sepehr bookings:', error);
      // Mock data for demonstration
      setBookings([
        {
          id: '1',
          bookingId: 'SEP-001',
          flightId: 'FL-001',
          passengerName: 'احمد محمدی',
          passengerEmail: 'ahmad@example.com',
          passengerPhone: '09123456789',
          status: 'CONFIRMED',
          totalAmount: 2500000,
          currency: 'IRR',
          bookingDate: '2024-01-15',
          flightDetails: {
            from: 'تهران',
            to: 'مشهد',
            departureDate: '2024-01-20T08:00:00Z',
            arrivalDate: '2024-01-20T09:30:00Z',
            airline: 'ایران ایر',
            flightNumber: 'IR-123',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          bookingId: 'SEP-002',
          flightId: 'FL-002',
          passengerName: 'فاطمه احمدی',
          passengerEmail: 'fatemeh@example.com',
          passengerPhone: '09123456788',
          status: 'PENDING',
          totalAmount: 1800000,
          currency: 'IRR',
          bookingDate: '2024-01-16',
          flightDetails: {
            from: 'مشهد',
            to: 'تهران',
            departureDate: '2024-01-22T14:00:00Z',
            arrivalDate: '2024-01-22T15:30:00Z',
            airline: 'ماهان ایر',
            flightNumber: 'W5-456',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await apiService.put(`/api/v1/sepehr/bookings/${bookingId}/status`, { status: newStatus });
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این رزرو را لغو کنید؟')) {
      try {
        await apiService.post(`/api/v1/sepehr/booking/${bookingId}/cancel`);
        await fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const openBookingDetails = (booking: SepehrBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'تأیید شده';
      case 'PENDING':
        return 'در انتظار';
      case 'CANCELLED':
        return 'لغو شده';
      case 'REFUNDED':
        return 'بازپرداخت شده';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
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
          <ClipboardListIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مدیریت رزروهای سپهر</h2>
            <p className="text-gray-600">مدیریت و پیگیری رزروهای انجام شده از طریق سپهر</p>
          </div>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار</option>
              <option value="CONFIRMED">تأیید شده</option>
              <option value="CANCELLED">لغو شده</option>
              <option value="REFUNDED">بازپرداخت شده</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">جستجو</label>
            <input
              type="text"
              placeholder="نام مسافر یا شماره رزرو"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  مبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
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
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{booking.passengerName}</div>
                      <div className="text-gray-500">{booking.passengerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{booking.flightDetails.from} → {booking.flightDetails.to}</div>
                      <div className="text-gray-500">{booking.flightDetails.airline} {booking.flightDetails.flightNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(booking.totalAmount)} {booking.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openBookingDetails(booking)}
                        className="text-blue-600 hover:text-blue-900"
                        title="مشاهده جزئیات"
                      >
                        <InfoIcon className="w-4 h-4" />
                      </button>
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                            className="text-green-600 hover:text-green-900"
                            title="تأیید رزرو"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                            title="لغو رزرو"
                          >
                            <XIcon className="w-4 h-4" />
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
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ClipboardListIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ رزروی یافت نشد</h3>
          <p className="text-gray-500">با فیلترهای انتخابی هیچ رزروی وجود ندارد</p>
        </div>
      )}

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">جزئیات رزرو</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">شماره رزرو</label>
                  <p className="text-sm text-gray-900">{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">وضعیت</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">اطلاعات مسافر</label>
                <div className="mt-1 text-sm text-gray-900">
                  <p>نام: {selectedBooking.passengerName}</p>
                  <p>ایمیل: {selectedBooking.passengerEmail}</p>
                  <p>تلفن: {selectedBooking.passengerPhone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">اطلاعات پرواز</label>
                <div className="mt-1 text-sm text-gray-900">
                  <p>مسیر: {selectedBooking.flightDetails.from} → {selectedBooking.flightDetails.to}</p>
                  <p>ایرلاین: {selectedBooking.flightDetails.airline}</p>
                  <p>شماره پرواز: {selectedBooking.flightDetails.flightNumber}</p>
                  <p>تاریخ پرواز: {formatDate(selectedBooking.flightDetails.departureDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">مبلغ کل</label>
                  <p className="text-sm text-gray-900">{formatPrice(selectedBooking.totalAmount)} {selectedBooking.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاریخ رزرو</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SepehrBookingsManagement;

















