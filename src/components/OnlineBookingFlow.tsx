import React, { useState, useEffect } from 'react';
import { SepehrApiService } from '../services/sepehrApiService';
import { SepehrFlightSearchDto, SepehrBookingDto } from '../types/sepehr';
import { useLocalization } from '../hooks/useLocalization';

interface OnlineBookingFlowProps {
  flight: any;
  passengers: any[];
  contactInfo: any;
  onBookingComplete: (result: any) => void;
}

const OnlineBookingFlow: React.FC<OnlineBookingFlowProps> = ({
  flight,
  passengers,
  contactInfo,
  onBookingComplete
}) => {
  const { t, formatNumber } = useLocalization();
  const [step, setStep] = useState<'wallet_check' | 'block_funds' | 'booking_request' | 'confirmation' | 'ticket_issuance' | 'completed'>('wallet_check');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [blockedAmount, setBlockedAmount] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed' | 'rejected' | 'error'>('pending');
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const sepehrService = new SepehrApiService();
  const totalPrice = Math.round((flight.price.total || 0) / 10); // Convert to Tomans

  // Step 1: Check wallet balance
  const checkWalletBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
        
        if (data.balance >= totalPrice) {
          setStep('block_funds');
        } else {
          setError('موجودی کیف پول کافی نیست');
        }
      }
    } catch (error) {
      setError('خطا در بررسی موجودی کیف پول');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Block funds in wallet
  const blockFunds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/wallet/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          amount: totalPrice * 10, // Convert back to Rials for backend
          reason: 'رزرو آنلاین پرواز',
          flightId: flight.id,
          description: `رزرو پرواز ${flight.flightNumber}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedAmount(data.blockedAmount);
        setBookingId(data.transactionId);
        setStep('booking_request');
      } else {
        setError('خطا در بلوکه کردن پول');
      }
    } catch (error) {
      setError('خطا در بلوکه کردن پول');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Send booking request to Sepehr
  const sendBookingRequest = async () => {
    setLoading(true);
    try {
      const bookingDto: SepehrBookingDto = {
        flightId: flight.id,
        passengers: passengers.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender === 'MALE' ? 'male' : 'female',
          birthDate: p.dateOfBirth,
          nationality: p.nationality === 'Iranian' ? 'IR' : 'US'
        })),
        contactInfo: {
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        paymentInfo: {
          method: 'wallet_blocked',
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        }
      };

      const response = await sepehrService.bookFlight(bookingDto);
      
      if (response.success) {
        setBookingStatus('confirmed');
        setStep('confirmation');
      } else {
        setBookingStatus('rejected');
        setError('رزرو رد شد - پول بازگردانده می‌شود');
        // Unblock funds
        await unblockFunds();
      }
    } catch (error) {
      setBookingStatus('error');
      setError('خطا در رزرو - پول بازگردانده می‌شود');
      // Unblock funds
      await unblockFunds();
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Confirm booking and issue ticket
  const confirmBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          flightId: flight.id,
          passengers: passengers,
          contactInfo: contactInfo,
          totalPrice: totalPrice * 10 // Convert to Rials
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTicketData(data.ticket);
        setStep('ticket_issuance');
      } else {
        setError('خطا در تأیید رزرو');
      }
    } catch (error) {
      setError('خطا در تأیید رزرو');
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Issue ticket automatically
  const issueTicket = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/tickets/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          flightId: flight.id,
          passengers: passengers,
          ticketData: ticketData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStep('completed');
        onBookingComplete(data);
      } else {
        setError('خطا در صدور بلیط');
      }
    } catch (error) {
      setError('خطا در صدور بلیط');
    } finally {
      setLoading(false);
    }
  };

  // Unblock funds in case of error
  const unblockFunds = async () => {
    try {
      await fetch('/api/v1/wallet/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          transactionId: bookingId,
          reason: 'خطا در رزرو'
        })
      });
    } catch (error) {
      console.error('Error unblocking funds:', error);
    }
  };

  // Auto-progress through steps
  useEffect(() => {
    switch (step) {
      case 'wallet_check':
        checkWalletBalance();
        break;
      case 'block_funds':
        blockFunds();
        break;
      case 'booking_request':
        sendBookingRequest();
        break;
      case 'confirmation':
        confirmBooking();
        break;
      case 'ticket_issuance':
        issueTicket();
        break;
    }
  }, [step]);

  const getStepTitle = () => {
    switch (step) {
      case 'wallet_check': return 'بررسی موجودی کیف پول';
      case 'block_funds': return 'بلوکه کردن پول';
      case 'booking_request': return 'ارسال درخواست رزرو';
      case 'confirmation': return 'تأیید رزرو';
      case 'ticket_issuance': return 'صدور بلیط';
      case 'completed': return 'رزرو تکمیل شد';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'wallet_check': return `موجودی فعلی: ${formatNumber(walletBalance)} تومان`;
      case 'block_funds': return `مبلغ ${formatNumber(totalPrice)} تومان بلوکه شد`;
      case 'booking_request': return 'درخواست رزرو به سپهر ارسال شد';
      case 'confirmation': return 'رزرو تأیید شد - در حال صدور بلیط';
      case 'ticket_issuance': return 'بلیط صادر شد';
      case 'completed': return 'رزرو با موفقیت تکمیل شد';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-gray-600">
          {getStepDescription()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">پیشرفت رزرو</span>
          <span className="text-sm text-gray-600">
            {['wallet_check', 'block_funds', 'booking_request', 'confirmation', 'ticket_issuance', 'completed'].indexOf(step) + 1} / 6
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${((['wallet_check', 'block_funds', 'booking_request', 'confirmation', 'ticket_issuance', 'completed'].indexOf(step) + 1) / 6) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">در حال پردازش...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-2">❌</div>
            <div>
              <h3 className="font-semibold text-red-800">خطا</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {step === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-2">✅</div>
            <div>
              <h3 className="font-semibold text-green-800">رزرو موفق</h3>
              <p className="text-green-700">بلیط شما با موفقیت صادر شد</p>
            </div>
          </div>
        </div>
      )}

      {/* Flight Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">خلاصه پرواز</h3>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">{flight.flightNumber}</div>
            <div className="text-sm text-gray-600">
              {flight.departure.city} → {flight.arrival.city}
            </div>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {formatNumber(totalPrice)} تومان
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {step === 'completed' && (
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            چاپ بلیط
          </button>
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700"
          >
            مشاهده بلیط‌ها
          </button>
        </div>
      )}
    </div>
  );
};

export default OnlineBookingFlow;

