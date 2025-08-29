
import React, { forwardRef } from 'react';
import type { Booking, Language } from '../types';

interface PrintableTicketProps {
    booking: Booking;
    withPrice: boolean;
    t: (key: string, ...args: (string | number)[]) => string;
    formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
    formatNumber: (num: number) => string;
    language: Language;
}

export const PrintableTicket = forwardRef<HTMLDivElement, PrintableTicketProps>(({ booking, withPrice, t, formatDate, formatNumber, language }, ref) => {
    const allPassengers = [...booking.passengers.adults, ...booking.passengers.children, ...booking.passengers.infants];
    const totalPassengers = allPassengers.length;
    const finalPrice = (booking.flight.price + booking.flight.taxes) * totalPassengers;
    const direction = language === 'en' ? 'ltr' : 'rtl';

    return (
        <div ref={ref} className="p-8 bg-white" style={{ fontFamily: 'Vazirmatn, sans-serif', width: '800px', direction }}>
            <div className="flex justify-between items-center border-b-2 pb-4 mb-4 border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t('profile.myBookings.eTicketTitle')}</h1>
                    <p className="text-slate-500">{t('dashboard.bookings.refNumber')}: {booking.id}</p>
                </div>
                <div className={direction === 'rtl' ? 'text-left' : 'text-right'}>
                    <p className="text-2xl font-bold">{t('header.title')}</p>
                    <p className="text-slate-500">{t('profile.myBookings.issueDate')}: {formatDate(booking.bookingDate)}</p>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-3">{t('bookingReview.flightSummary')}</h2>
                <div className="border rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                    <div><strong>{t('flightCard.airline')}:</strong> {booking.flight.airline}</div>
                    <div><strong>{t('flightCard.flightNumber')}:</strong> {booking.flight.flightNumber}</div>
                    <div><strong>{t('flightCard.class')}:</strong> {booking.flight.flightClass}</div>
                    <div className="col-span-3 border-t my-2"></div>
                    <div><strong>{t('flightSearch.from')}:</strong> {booking.flight.departure.city} ({booking.flight.departure.airportCode})</div>
                    <div className="col-span-2"><strong>{t('flightSearch.departureDate')}:</strong> {formatDate(booking.flight.departure.dateTime, { dateStyle: 'full', timeStyle: 'short' })}</div>
                    <div><strong>{t('flightSearch.to')}:</strong> {booking.flight.arrival.city} ({booking.flight.arrival.airportCode})</div>
                    <div className="col-span-2"><strong>{t('flightSearch.returnDate')}:</strong> {formatDate(booking.flight.arrival.dateTime, { dateStyle: 'full', timeStyle: 'short' })}</div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-3">{t('bookingReview.passengerDetails')}</h2>
                <table className="w-full text-right border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="border p-2 font-semibold">#</th>
                            <th className="border p-2 font-semibold">{t('profile.myProfile.fullName')}</th>
                            <th className="border p-2 font-semibold">{t('bookingReview.gender')}</th>
                            <th className="border p-2 font-semibold">{t('bookingReview.idNumber')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPassengers.map((p, index) => (
                            <tr key={index}>
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{p.firstName} {p.lastName}</td>
                                <td className="border p-2">{p.gender === 'MALE' ? t('passengerDetails.male') : t('passengerDetails.female')}</td>
                                <td className="border p-2">{p.nationalId || p.passportNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {withPrice && (
                 <div className="mb-6">
                    <h2 className="text-xl font-bold text-primary mb-3">{t('priceSummary.title')}</h2>
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                        <span className="font-bold text-lg">{t('profile.myBookings.finalAmount')}:</span>
                        <span className="font-bold text-lg text-accent">{formatNumber(finalPrice)} {t('flightCard.currency')}</span>
                    </div>
                </div>
            )}
            
            <div className="text-center text-slate-500 border-t pt-4 mt-8">
                <p>{t('profile.myBookings.footerMessage')}</p>
            </div>
        </div>
    );
});
