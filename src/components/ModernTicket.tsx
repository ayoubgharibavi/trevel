import React, { forwardRef } from 'react';
import type { Booking, Language } from '../types';

interface ModernTicketProps {
  booking: Booking;
  withPrice: boolean;
  t: (key: string, ...args: (string | number)[]) => string;
  formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  language: Language;
}

const parseCityName = (cityData: any, language: Language): string => {
  if (!cityData) return 'نامشخص';
  
  if (typeof cityData === 'string') {
    try {
      const parsed = JSON.parse(cityData);
      return parsed[language] || parsed.fa || parsed.en || cityData;
    } catch {
      return cityData;
    }
  }
  
  if (typeof cityData === 'object') {
    return cityData[language] || cityData.fa || cityData.en || 'نامشخص';
  }
  
  return 'نامشخص';
};

export const ModernTicket = forwardRef<HTMLDivElement, ModernTicketProps>(({ 
  booking, 
  withPrice, 
  t, 
  formatDate, 
  formatNumber, 
  language 
}, ref) => {
  const allPassengers = [...(booking.passengers?.adults || []), ...(booking.passengers?.children || []), ...(booking.passengers?.infants || [])];
  const totalPassengers = allPassengers.length;
  const finalPrice = (booking.flight.price + booking.flight.taxes) * totalPassengers;
  const direction = language === 'en' ? 'ltr' : 'rtl';

  return (
    <div ref={ref} className="p-8 bg-white" style={{ fontFamily: 'Vazirmatn, sans-serif', width: '800px', direction }}>
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 pb-4 mb-6 border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('profile.myBookings.eTicketTitle')}</h1>
          <p className="text-slate-500">{t('dashboard.bookings.refNumber')}: {booking.id}</p>
        </div>
        <div className={direction === 'rtl' ? 'text-left' : 'text-right'}>
          <p className="text-2xl font-bold">{t('header.title')}</p>
          <p className="text-slate-500">{t('profile.myBookings.issueDate')}: {formatDate(booking.bookingDate)}</p>
        </div>
      </div>

      {/* Flight Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-3">{t('bookingReview.flightSummary')}</h2>
        <div className="border rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-slate-600">{t('flightSearch.from')}</p>
            <p className="text-slate-800">{parseCityName(booking.flight.departureAirport?.city || booking.flight.departure?.city, language)}</p>
            <p className="text-slate-500">{booking.flight.departureAirport?.iata || booking.flight.departure?.airportCode || 'نامشخص'}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-600">{t('flightSearch.to')}</p>
            <p className="text-slate-800">{parseCityName(booking.flight.arrivalAirport?.city || booking.flight.arrival?.city, language)}</p>
            <p className="text-slate-500">{booking.flight.arrivalAirport?.iata || booking.flight.arrival?.airportCode || 'نامشخص'}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-600">{t('flightSearch.date')}</p>
            <p className="text-slate-800">{formatDate(String(booking.flight.departureTime || booking.flight.departureDate))}</p>
            <p className="text-slate-500">{booking.flight.departureTime || booking.flight.departureDate}</p>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-3">{t('bookingReview.passengerDetails')}</h2>
        <div className="space-y-3">
          {allPassengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-3 bg-slate-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-600">{t('bookingReview.passengerName')}</p>
                  <p className="text-slate-800">{passenger.firstName} {passenger.lastName}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-600">{t('bookingReview.passengerType')}</p>
                  <p className="text-slate-800">
                    {index < (booking.passengers?.adults?.length || 0) ? t('bookingReview.adult') :
                     index < (booking.passengers?.adults?.length || 0) + (booking.passengers?.children?.length || 0) ? t('bookingReview.child') :
                     t('bookingReview.infant')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      {withPrice && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-3">{t('bookingReview.priceSummary')}</h2>
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t('bookingReview.totalPrice')}</span>
              <span className="text-primary">{formatNumber(finalPrice)} {t('common.currency')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-300">
        <p className="text-xs text-slate-500 text-center">
          {t('profile.myBookings.eTicketNote')}
        </p>
      </div>
    </div>
  );
});

ModernTicket.displayName = 'ModernTicket';