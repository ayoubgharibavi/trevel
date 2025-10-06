import React, { useState, useEffect } from 'react';
import { charter118Service, Charter118FlightSearchRequest, Charter118BookingRequest } from '../../services/charter118Service';
import { useLocalization } from '../../hooks/useLocalization';

interface Charter118DashboardProps {
  onBookingSuccess?: (bookingId: string) => void;
}

export const Charter118Dashboard: React.FC<Charter118DashboardProps> = ({ onBookingSuccess }) => {
  const { t, language } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [searchForm, setSearchForm] = useState<Charter118FlightSearchRequest>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    }
  });
  const [bookingForm, setBookingForm] = useState<Charter118BookingRequest>({
    flightId: '',
    passengers: {
      adults: [{ firstName: '', lastName: '', nationality: 'Iranian', passportNumber: '', birthDate: '' }],
      children: [],
      infants: []
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await charter118Service.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
    setIsLoading(false);
  };

  const handleSearchFlights = async () => {
    if (!searchForm.origin || !searchForm.destination || !searchForm.departureDate) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    setIsLoading(true);
    try {
      const result = await charter118Service.searchFlights(searchForm);
      if (result.success) {
        setFlights(result.data || []);
      } else {
        alert(`خطا در جستجو: ${result.error}`);
      }
    } catch (error) {
      alert('خطا در جستجوی پروازها');
    }
    setIsLoading(false);
  };

  const handleBookFlight = async () => {
    if (!selectedFlight) {
      alert('لطفاً ابتدا یک پرواز انتخاب کنید');
      return;
    }

    if (!bookingForm.contactInfo.email || !bookingForm.contactInfo.phone) {
      alert('لطفاً اطلاعات تماس را کامل کنید');
      return;
    }

    setIsLoading(true);
    try {
      const bookingRequest = {
        ...bookingForm,
        flightId: selectedFlight.id
      };

      const result = await charter118Service.createBooking(bookingRequest);
      if (result.bookingId) {
        alert(`رزرو موفقیت‌آمیز! شماره رزرو: ${result.bookingId}`);
        onBookingSuccess?.(result.bookingId);
        setSelectedFlight(null);
        setFlights([]);
      } else {
        alert(`خطا در رزرو: ${result.status}`);
      }
    } catch (error) {
      alert('خطا در رزرو پرواز');
    }
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' ریال';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Charter118 Integration</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' ? 'متصل' : 
             connectionStatus === 'disconnected' ? 'قطع شده' : 'نامشخص'}
          </span>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            تست اتصال
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">جستجوی پرواز</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">مبدأ</label>
            <input
              type="text"
              value={searchForm.origin}
              onChange={(e) => setSearchForm(prev => ({ ...prev, origin: e.target.value }))}
              placeholder="کد فرودگاه مبدأ"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">مقصد</label>
            <input
              type="text"
              value={searchForm.destination}
              onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="کد فرودگاه مقصد"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاریخ رفت</label>
            <input
              type="date"
              value={searchForm.departureDate}
              onChange={(e) => setSearchForm(prev => ({ ...prev, departureDate: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاریخ برگشت (اختیاری)</label>
            <input
              type="date"
              value={searchForm.returnDate}
              onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">بزرگسالان</label>
            <input
              type="number"
              min="1"
              value={searchForm.adults}
              onChange={(e) => setSearchForm(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">کودکان</label>
            <input
              type="number"
              min="0"
              value={searchForm.children}
              onChange={(e) => setSearchForm(prev => ({ ...prev, children: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleSearchFlights}
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'در حال جستجو...' : 'جستجوی پروازها'}
        </button>
      </div>

      {/* Flight Results */}
      {flights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">نتایج جستجو ({flights.length} پرواز)</h3>
          <div className="space-y-4">
            {flights.map((flight, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFlight?.id === flight.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFlight(flight)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{flight.airline}</div>
                    <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                    <div className="text-sm">
                      {flight.origin} → {flight.destination}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(flight.departureTime)} - {formatTime(flight.departureTime)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatPrice(flight.price)}</div>
                    <div className="text-sm text-gray-600">{flight.cabinClass}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {selectedFlight && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">اطلاعات رزرو</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ایمیل</label>
              <input
                type="email"
                value={bookingForm.contactInfo.email}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تلفن</label>
              <input
                type="tel"
                value={bookingForm.contactInfo.phone}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نام</label>
              <input
                type="text"
                value={bookingForm.contactInfo.firstName}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, firstName: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نام خانوادگی</label>
              <input
                type="text"
                value={bookingForm.contactInfo.lastName}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, lastName: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={handleBookFlight}
            disabled={isLoading}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'در حال رزرو...' : 'رزرو پرواز'}
          </button>
        </div>
      )}
    </div>
  );
};

















