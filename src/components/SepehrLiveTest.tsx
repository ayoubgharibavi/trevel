import React, { useState } from 'react';
import { SepehrApiService } from '../services/sepehrApiService';
import { SepehrFlightSearchDto } from '../types/sepehr';
import { useLocalization } from '../hooks/useLocalization';

const SepehrLiveTest: React.FC = () => {
  const { t, formatNumber } = useLocalization();
  const [searchParams, setSearchParams] = useState({
    origin: 'IKA',
    destination: 'DXB',
    departureDate: '2024-01-20',
    adults: 1,
    children: 0,
    infants: 0,
    class: 'economy'
  });
  
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    passengers: [{
      firstName: 'علی',
      lastName: 'احمدی',
      gender: 'male',
      birthDate: '1990-01-01',
      nationality: 'IR'
    }],
    contactInfo: {
      email: 'test@example.com',
      phone: '09123456789'
    }
  });
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const sepehrService = new SepehrApiService();

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('🔍 Searching Sepehr flights with params:', searchParams);
      
      const searchDto: SepehrFlightSearchDto = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        class: searchParams.class
      };

      const response = await sepehrService.searchFlights(searchDto);
      console.log('✅ Sepehr search response:', response);
      
      if (response.success && response.data) {
        setFlights(response.data);
        console.log(`✅ Found ${response.data.length} flights`);
      } else {
        console.error('❌ Search failed:', response.message);
        setFlights([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = async () => {
    if (!selectedFlight) return;
    
    setBookingLoading(true);
    try {
      console.log('🔍 Booking flight:', selectedFlight.id);
      
      const bookingDto = {
        flightId: selectedFlight.id,
        passengers: bookingData.passengers,
        contactInfo: bookingData.contactInfo,
        paymentInfo: {
          method: 'wallet',
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        }
      };

      const response = await sepehrService.bookFlight(bookingDto);
      console.log('✅ Booking response:', response);
      
      setBookingResult(response);
    } catch (error) {
      console.error('❌ Booking error:', error);
      setBookingResult({ success: false, error: error.message });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('fa-IR');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        تست زنده سپهر - جستجو و خرید بلیط
      </h1>

      {/* Search Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">پارامترهای جستجو</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مبدا</label>
            <input
              type="text"
              value={searchParams.origin}
              onChange={(e) => setSearchParams({...searchParams, origin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="IKA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مقصد</label>
            <input
              type="text"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DXB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پرواز</label>
            <input
              type="date"
              value={searchParams.departureDate}
              onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">بزرگسال</label>
            <input
              type="number"
              min="1"
              value={searchParams.adults}
              onChange={(e) => setSearchParams({...searchParams, adults: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">کودک</label>
            <input
              type="number"
              min="0"
              value={searchParams.children}
              onChange={(e) => setSearchParams({...searchParams, children: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوزاد</label>
            <input
              type="number"
              min="0"
              value={searchParams.infants}
              onChange={(e) => setSearchParams({...searchParams, infants: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'در حال جستجو...' : 'جستجوی پروازها'}
        </button>
      </div>

      {/* Flight Results */}
      {flights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">نتایج جستجو ({flights.length} پرواز)</h2>
          <div className="space-y-4">
            {flights.map((flight, index) => (
              <div
                key={flight.id || index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedFlight?.id === flight.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFlight(flight)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-lg font-bold">{flight.flightNumber}</div>
                      <div className="text-sm text-gray-600">{flight.airline.name}</div>
                      <div className="text-sm text-gray-600">{flight.aircraft}</div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <div className="font-semibold">{formatTime(flight.departure.dateTime)}</div>
                        <div className="text-gray-600">{flight.departure.airportCode}</div>
                        <div className="text-gray-500">{flight.departure.city}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-px bg-gray-400"></div>
                        <div className="text-xs text-gray-500">{flight.duration}</div>
                        <div className="w-8 h-px bg-gray-400"></div>
                      </div>
                      
                      <div>
                        <div className="font-semibold">{formatTime(flight.arrival.dateTime)}</div>
                        <div className="text-gray-600">{flight.arrival.airportCode}</div>
                        <div className="text-gray-500">{flight.arrival.city}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(Math.round(flight.price.total / 10))} تومان
                    </div>
                    <div className="text-sm text-gray-600">{flight.flightClass}</div>
                    <div className="text-xs text-gray-500">{flight.availableSeats} صندلی باقی مانده</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Section */}
      {selectedFlight && (
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">اطلاعات رزرو</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">پرواز انتخاب شده:</h3>
            <div className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{selectedFlight.flightNumber}</div>
                  <div className="text-sm text-gray-600">
                    {selectedFlight.departure.city} → {selectedFlight.arrival.city}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedFlight.departure.dateTime)} - {formatTime(selectedFlight.departure.dateTime)}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(Math.round(selectedFlight.price.total / 10))} تومان
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">اطلاعات مسافر:</h3>
            <div className="bg-white p-3 rounded border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                  <input
                    type="text"
                    value={bookingData.passengers[0].firstName}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      passengers: [{
                        ...bookingData.passengers[0],
                        firstName: e.target.value
                      }]
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                  <input
                    type="text"
                    value={bookingData.passengers[0].lastName}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      passengers: [{
                        ...bookingData.passengers[0],
                        lastName: e.target.value
                      }]
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                  <input
                    type="email"
                    value={bookingData.contactInfo.email}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      contactInfo: {
                        ...bookingData.contactInfo,
                        email: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
                  <input
                    type="tel"
                    value={bookingData.contactInfo.phone}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      contactInfo: {
                        ...bookingData.contactInfo,
                        phone: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookFlight}
            disabled={bookingLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? 'در حال رزرو...' : 'رزرو بلیط'}
          </button>
        </div>
      )}

      {/* Booking Result */}
      {bookingResult && (
        <div className={`rounded-lg p-6 ${bookingResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h2 className="text-xl font-semibold mb-4">
            {bookingResult.success ? '✅ رزرو موفق' : '❌ خطا در رزرو'}
          </h2>
          
          {bookingResult.success ? (
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <div className="font-semibold">شماره رزرو: {bookingResult.data?.bookingId}</div>
                <div className="text-sm text-gray-600">PNR: {bookingResult.data?.pnr}</div>
                <div className="text-sm text-gray-600">وضعیت: {bookingResult.data?.status}</div>
              </div>
              
              {bookingResult.data?.passengers && (
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold mb-2">مسافران:</h3>
                  {bookingResult.data.passengers.map((passenger: any, index: number) => (
                    <div key={index} className="text-sm">
                      {passenger.name} - صندلی: {passenger.seatNumber} - بلیط: {passenger.ticketNumber}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-white p-3 rounded border">
                <div className="font-semibold">مبلغ کل: {formatNumber(Math.round(bookingResult.data?.totalPrice / 10))} تومان</div>
                <div className="text-sm text-gray-600">وضعیت پرداخت: {bookingResult.data?.paymentStatus}</div>
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              خطا: {bookingResult.error || 'خطای نامشخص'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SepehrLiveTest;

