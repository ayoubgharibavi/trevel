import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface CRSBookingFlowProps {
  flight: any;
  onBookingComplete: (result: any) => void;
  onCancel: () => void;
}

interface PassengerData {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  nationality: string;
}

interface ContactInfo {
  email: string;
  phone: string;
}

const CRSBookingFlow: React.FC<CRSBookingFlowProps> = ({
  flight,
  onBookingComplete,
  onCancel
}) => {
  const { t, formatNumber, formatDate } = useLocalization();
  const [step, setStep] = useState<'passengers' | 'contact' | 'confirmation' | 'processing' | 'completed'>('passengers');
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Initialize passengers based on flight selection
  useEffect(() => {
    if (flight && passengers.length === 0) {
      const initialPassengers: PassengerData[] = Array.from({ length: 1 }, () => ({
        firstName: '',
        lastName: '',
        gender: 'MALE',
        birthDate: '',
        nationality: 'Iranian'
      }));
      setPassengers(initialPassengers);
    }
  }, [flight, passengers.length]);

  const addPassenger = () => {
    setPassengers([...passengers, {
      firstName: '',
      lastName: '',
      gender: 'MALE',
      birthDate: '',
      nationality: 'Iranian'
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: keyof PassengerData, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  const validatePassengers = (): boolean => {
    return passengers.every(p => 
      p.firstName.trim() && 
      p.lastName.trim() && 
      p.birthDate && 
      p.nationality
    );
  };

  const validateContact = (): boolean => {
    return contactInfo.email.trim() && contactInfo.phone.trim();
  };

  const calculateTotalPrice = (): number => {
    const basePrice = flight.price || 0;
    const taxes = flight.taxes || 0;
    const fees = flight.fees || 0;
    return (basePrice + taxes + fees) * passengers.length;
  };

  const createBooking = async () => {
    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const bookingRequest = {
        flightId: flight.id,
        passengers: passengers.map(p => ({
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          gender: p.gender,
          birthDate: p.birthDate,
          nationality: p.nationality
        })),
        contactInfo: {
          email: contactInfo.email.trim(),
          phone: contactInfo.phone.trim()
        },
        totalPrice: calculateTotalPrice()
      };

      const response = await fetch('/api/v1/simple-booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(bookingRequest)
      });

      const result = await response.json();

      if (result.success) {
        setBookingResult(result.data);
        setStep('completed');
        onBookingComplete(result.data);
      } else {
        setError(result.error || 'خطا در ایجاد رزرو');
        setStep('confirmation');
      }

    } catch (error) {
      setError('خطا در ارتباط با سرور');
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    switch (step) {
      case 'passengers':
        if (validatePassengers()) {
          setStep('contact');
        } else {
          setError('لطفاً اطلاعات تمام مسافران را تکمیل کنید');
        }
        break;
      case 'contact':
        if (validateContact()) {
          setStep('confirmation');
        } else {
          setError('لطفاً اطلاعات تماس را تکمیل کنید');
        }
        break;
      case 'confirmation':
        createBooking();
        break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case 'contact':
        setStep('passengers');
        break;
      case 'confirmation':
        setStep('contact');
        break;
    }
    setError('');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'passengers': return 'اطلاعات مسافران';
      case 'contact': return 'اطلاعات تماس';
      case 'confirmation': return 'تأیید نهایی';
      case 'processing': return 'در حال پردازش';
      case 'completed': return 'رزرو تکمیل شد';
      default: return '';
    }
  };

  const getStepNumber = () => {
    const steps = ['passengers', 'contact', 'confirmation', 'processing', 'completed'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">رزرو پرواز</h1>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{getStepTitle()}</span>
          <span className="text-sm text-gray-600">
            {getStepNumber()} / 5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(getStepNumber() / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">خلاصه پرواز</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">شماره پرواز</div>
            <div className="font-medium">{flight.flightNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">ایرلاین</div>
            <div className="font-medium">{flight.airline}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">مبدا</div>
            <div className="font-medium">{flight.departure?.city}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">مقصد</div>
            <div className="font-medium">{flight.arrival?.city}</div>
          </div>
        </div>
      </div>

      {/* Error Display */}
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

      {/* Step Content */}
      {step === 'passengers' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">اطلاعات مسافران</h2>
          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">مسافر {index + 1}</h3>
                {passengers.length > 1 && (
                  <button
                    onClick={() => removePassenger(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">جنسیت</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">آقا</option>
                    <option value="FEMALE">خانم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ تولد</label>
                  <input
                    type="date"
                    value={passenger.birthDate}
                    onChange={(e) => updatePassenger(index, 'birthDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملیت</label>
                  <select
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Iranian">ایرانی</option>
                    <option value="Foreign">خارجی</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addPassenger}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 border-2 border-dashed border-gray-300"
          >
            + افزودن مسافر
          </button>
        </div>
      )}

      {step === 'contact' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">اطلاعات تماس</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن</label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">تأیید نهایی</h2>
          
          {/* Passengers Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">مسافران</h3>
            {passengers.map((passenger, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span>{passenger.firstName} {passenger.lastName}</span>
                <span className="text-sm text-gray-600">{passenger.gender === 'MALE' ? 'آقا' : 'خانم'}</span>
              </div>
            ))}
          </div>

          {/* Contact Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">اطلاعات تماس</h3>
            <div className="space-y-1">
              <div>ایمیل: {contactInfo.email}</div>
              <div>تلفن: {contactInfo.phone}</div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">قیمت</h3>
            <div className="space-y-1">
              <div className="font-semibold">مجموع: {formatNumber(Math.round(calculateTotalPrice() / 10))} تومان</div>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">در حال پردازش رزرو</h2>
          <p className="text-gray-600">لطفاً صبر کنید...</p>
        </div>
      )}

      {step === 'completed' && bookingResult && (
        <div className="text-center py-8">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">رزرو با موفقیت انجام شد!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div><strong>شماره رزرو:</strong> {bookingResult.bookingId}</div>
              <div><strong>وضعیت:</strong> {bookingResult.status}</div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            رزرو شما ایجاد شد و در انتظار تأیید ادمین است. 
            پس از تأیید، بلیط شما صادر خواهد شد.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              مشاهده رزروها
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step !== 'processing' && step !== 'completed' && (
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={step === 'passengers'}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          <button
            onClick={nextStep}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {step === 'confirmation' ? 'تأیید و رزرو' : 'بعدی'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CRSBookingFlow;

