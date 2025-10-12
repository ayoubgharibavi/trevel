import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import CRSBookingFlow from './CRSBookingFlow';

interface CRSBookingTestProps {
  onClose: () => void;
}

const CRSBookingTest: React.FC<CRSBookingTestProps> = ({ onClose }) => {
  const { t, formatNumber } = useLocalization();
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample flights for testing
  const sampleFlights = [
    {
      id: 'crs-flight-1',
      flightNumber: 'IR123',
      airline: 'ایران ایر',
      departure: {
        city: 'تهران',
        airport: 'IKA',
        dateTime: '2024-01-15T08:00:00Z'
      },
      arrival: {
        city: 'استانبول',
        airport: 'IST',
        dateTime: '2024-01-15T12:30:00Z'
      },
      price: 15000000, // 1,500,000 Rials
      taxes: 2000000,  // 200,000 Rials
      fees: 500000,    // 50,000 Rials
      duration: '4h 30m',
      stops: 0,
      class: 'economy',
      baggageAllowance: '20 KG',
      sourcingType: 'System'
    },
    {
      id: 'crs-flight-2',
      flightNumber: 'TK456',
      airline: 'ترکیش ایرلاینز',
      departure: {
        city: 'تهران',
        airport: 'IKA',
        dateTime: '2024-01-16T14:00:00Z'
      },
      arrival: {
        city: 'دبی',
        airport: 'DXB',
        dateTime: '2024-01-16T18:45:00Z'
      },
      price: 12000000, // 1,200,000 Rials
      taxes: 1500000,  // 150,000 Rials
      fees: 300000,    // 30,000 Rials
      duration: '3h 45m',
      stops: 0,
      class: 'economy',
      baggageAllowance: '25 KG',
      sourcingType: 'Charter'
    },
    {
      id: 'crs-flight-3',
      flightNumber: 'WZ789',
      airline: 'ماهان ایر',
      departure: {
        city: 'تهران',
        airport: 'IKA',
        dateTime: '2024-01-17T20:30:00Z'
      },
      arrival: {
        city: 'کوالالامپور',
        airport: 'KUL',
        dateTime: '2024-01-18T06:15:00Z'
      },
      price: 25000000, // 2,500,000 Rials
      taxes: 3000000,  // 300,000 Rials
      fees: 800000,    // 80,000 Rials
      duration: '8h 45m',
      stops: 1,
      class: 'business',
      baggageAllowance: '30 KG',
      sourcingType: 'System'
    }
  ];

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight);
    setShowBookingFlow(true);
  };

  const handleBookingComplete = (result: any) => {
    console.log('Booking completed:', result);
    // Here you would typically show a success message or redirect
    alert(`رزرو با موفقیت انجام شد!\nشماره رزرو: ${result.bookingId}\nکد تأیید: ${result.confirmationCode}`);
  };

  const handleBookingCancel = () => {
    setShowBookingFlow(false);
    setSelectedFlight(null);
  };

  if (showBookingFlow && selectedFlight) {
    return (
      <CRSBookingFlow
        flight={selectedFlight}
        onBookingComplete={handleBookingComplete}
        onCancel={handleBookingCancel}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تست سیستم رزرو CRS</h1>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-800 mb-2">ℹ️ درباره سیستم CRS</h2>
        <p className="text-blue-700 text-sm">
          سیستم رزرو مشتریان (Customer Reservation System) یک راه‌حل کامل برای مدیریت رزروهای آنلاین است که شامل:
        </p>
        <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
          <li>بلوکه کردن پول قبل از تأیید</li>
          <li>فلوی step-by-step برای رزرو</li>
          <li>مدیریت کامل توسط ادمین</li>
          <li>صدور خودکار بلیط پس از تأیید</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">پروازهای نمونه</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleFlights.map((flight) => (
            <div key={flight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-lg">{flight.flightNumber}</div>
                  <div className="text-sm text-gray-600">{flight.airline}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatNumber(Math.round((flight.price + flight.taxes + flight.fees) / 10))} تومان
                  </div>
                  <div className="text-xs text-gray-500">قیمت کل</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مبدا</span>
                  <span className="font-medium">{flight.departure.city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مقصد</span>
                  <span className="font-medium">{flight.arrival.city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مدت پرواز</span>
                  <span className="font-medium">{flight.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">توقف</span>
                  <span className="font-medium">{flight.stops === 0 ? 'بدون توقف' : `${flight.stops} توقف`}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {flight.class}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {flight.baggageAllowance}
                </span>
                {flight.sourcingType === 'Charter' && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    چارتری
                  </span>
                )}
                {flight.sourcingType === 'System' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    سیستمی
                  </span>
                )}
              </div>

              <button
                onClick={() => handleFlightSelect(flight)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                شروع رزرو
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📋 مراحل رزرو:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>انتخاب پرواز از لیست بالا</li>
          <li>ورود اطلاعات مسافران</li>
          <li>اطلاعات تماس</li>
          <li>انتخاب روش پرداخت</li>
          <li>تأیید نهایی و ایجاد رزرو</li>
          <li>تأیید توسط ادمین (در پنل ادمین)</li>
          <li>صدور خودکار بلیط</li>
        </ol>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default CRSBookingTest;

