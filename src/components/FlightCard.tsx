import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Flight, RefundPolicy, User, Currency } from '@/types';
import { PlaneIcon } from '@/components/icons/PlaneIcon';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  currentUser: User | null;
  currencies: Currency[];
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  onSelect,
  refundPolicies,
  currentUser,
  currencies,
}) => {
  const { t, formatNumber } = useLocalization();

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const totalPrice = Number(flight.price) + Number(flight.taxes);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group relative">
      {/* Special Offer Badge */}
      <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        پیشنهاد ویژه
      </div>
      
      <div className="p-6">
        {/* Flight Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {flight.airlineLogoUrl && flight.airlineLogoUrl.trim() !== '' ? (
                <img 
                  src={flight.airlineLogoUrl} 
                  alt={`${typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name && typeof flight.airline.name === 'string' ? flight.airline.name : 'Airline')} logo`} 
                  className="w-12 h-12 object-contain" 
                />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {typeof flight.airline === 'string' ? flight.airline.charAt(0).toUpperCase() : (flight.airline?.name && typeof flight.airline.name === 'string' ? flight.airline.name.charAt(0).toUpperCase() : 'A')}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name && typeof flight.airline.name === 'string' ? flight.airline.name : 'نامشخص')}
              </h3>
              <p className="text-sm text-gray-500">{flight.flightNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  flight.sourcingType === 'Charter' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {flight.sourcingType === 'Charter' ? 'چارتر' : 'سیستم'}
                </span>
                {flight.status && (
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    flight.status === 'ON_TIME' ? 'bg-green-100 text-green-700' :
                    flight.status === 'CLOSE' ? 'bg-red-100 text-red-700' :
                    flight.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {flight.status === 'ON_TIME' ? '✅ سر وقت' :
                     flight.status === 'CLOSE' ? '❌ بسته' :
                     flight.status === 'CANCELLED' ? '❌ لغو شده' :
                     flight.status === 'NO_AVAILABILITY' ? '⚠️ موجود نیست' :
                     flight.status === 'CALL_US' ? '📞 تماس بگیرید' :
                     flight.status}
                  </span>
                )}
                {/* Source tags removed as requested */}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              <CurrencyDisplay 
                valueIRR={totalPrice}
                currentUser={currentUser}
                currencies={currencies}
                mainClassName="text-2xl font-bold text-gray-800"
                subClassName="text-sm text-gray-500"
              />
            </div>
            <p className="text-sm text-gray-500">{t('flightCard.totalPrice')}</p>
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex items-center justify-between mb-6">
          {/* Departure */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : 'نامشخص'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {flight.departure?.airportCode || 'نامشخص'}
            </div>
            <div className="text-xs text-gray-500">
              {flight.departure?.city || 'نامشخص'}
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 flex flex-col items-center px-8">
            <div className="text-sm text-gray-500 mb-2">
              {typeof flight.duration === 'number' ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : flight.duration}
            </div>
            <div className="w-full h-1 bg-gray-200 relative rounded-full">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white absolute top-1/2 left-0 -translate-y-1/2"></div>
              <PlaneIcon className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1"/>
              <div className="w-3 h-3 rounded-full bg-blue-500 absolute top-1/2 right-0 -translate-y-1/2"></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {flight.stops === 0 ? t('flightCard.direct') : t('flightCard.stops', flight.stops)}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : 'نامشخص'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {flight.arrival?.airportCode || 'نامشخص'}
            </div>
            <div className="text-xs text-gray-500">
              {flight.arrival?.city || 'نامشخص'}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">کلاس پرواز:</span>
              <span className="font-medium text-gray-800 ml-1">{flight.flightClass || 'اکونومی'}</span>
            </div>
            <div>
              <span className="text-gray-600">هواپیما:</span>
              <span className="font-medium text-gray-800 ml-1">
                {flight.aircraft?.name?.fa || flight.aircraft?.name?.en || flight.aircraft?.name || flight.aircraft || 'نامشخص'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">بار مجاز:</span>
              <span className="font-medium text-gray-800 ml-1">{flight.baggageAllowance || '30 KG'}</span>
            </div>
            <div>
              <span className="text-gray-600">ظرفیت:</span>
              <span className="font-medium text-gray-800 ml-1">
                {flight.totalCapacity ? `${flight.availableSeats || 0}/${flight.totalCapacity}` : 'نامشخص'}
              </span>
            </div>
          </div>
          {flight.bookingClosesBeforeDepartureHours && (
            <div className="mt-2 text-sm">
              <span className="text-yellow-600">⚠️ فروش تا {flight.bookingClosesBeforeDepartureHours} ساعت قبل از پرواز</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="text-green-600 font-medium">
              {flight.availableSeats || Math.floor(Math.random() * 7 + 1)} صندلی باقی مانده
            </span>
          </div>
          
          <button
            onClick={() => onSelect(flight)}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('flightCard.selectFlight')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};