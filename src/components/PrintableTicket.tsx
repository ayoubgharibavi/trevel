import React, { forwardRef } from 'react';
import type { Booking, PassengerDetails, Language } from '../types';
import { ModernTicket } from './ModernTicket';

// Helper function to parse JSON city names and return appropriate language
const parseCityName = (cityData: string | object | undefined, language: string): string => {
    if (!cityData) return 'نامشخص';
    
    try {
        // If it's already a string (not JSON), return as is
        if (typeof cityData === 'string' && !cityData.startsWith('{')) {
            return cityData;
        }
        
        // Parse JSON and return appropriate language
        const parsed = typeof cityData === 'string' ? JSON.parse(cityData) : cityData;
        
        // Map language codes to our supported languages
        const langMap: { [key: string]: string } = {
            'fa': 'fa',
            'en': 'en', 
            'ar': 'ar'
        };
        
        const targetLang = langMap[language] || 'fa';
        return parsed[targetLang] || parsed.fa || parsed.en || parsed.ar || 'نامشخص';
    } catch (error) {
        // If parsing fails, return the original string or default
        return typeof cityData === 'string' ? cityData : 'نامشخص';
    }
};

interface PrintableTicketProps {
    booking: Booking;
    withPrice: boolean;
    t: (key: string, ...args: (string | number)[]) => string;
    formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
    formatNumber: (num: number) => string;
    language: Language;
}

export const PrintableTicket = forwardRef<HTMLDivElement, PrintableTicketProps>(({ booking, withPrice, t, formatDate, formatNumber, language }, ref) => {
    // Safe access to passengers with fallback
    const passengers = booking.passengers || { adults: [], children: [], infants: [] };
    const allPassengers = [...(passengers.adults || []), ...(passengers.children || []), ...(passengers.infants || [])];
    const totalPassengers = allPassengers.length;
    const finalPrice = (booking.flight?.price || 0) + (booking.flight?.taxes || 0) * totalPassengers;
    const direction = language === 'en' ? 'ltr' : 'rtl';

    return (
        <div ref={ref} className="bg-white" style={{ fontFamily: 'Vazirmatn, sans-serif', width: '800px', direction }}>
            {/* Header with Logo and Phone */}
            <div className="bg-blue-500 text-white p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-2xl text-blue-500">✈</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">TREVEL</h1>
                            <p className="text-blue-100 text-sm">trevel.com</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-white">📞</span>
                        <span className="text-sm">021-12345678</span>
                    </div>
                </div>
            </div>

            {/* Passenger Information */}
            <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">First name</label>
                        <div className="font-semibold">{allPassengers[0]?.firstName || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Last name</label>
                        <div className="font-semibold">{allPassengers[0]?.lastName || 'N/A'}</div>
                    </div>
                <div>
                        <label className="block text-gray-600 text-xs mb-1">ID number/passport</label>
                        <div className="font-semibold">{allPassengers[0]?.nationalId || allPassengers[0]?.passportNumber || 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* Origin and Destination */}
            <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Origin</label>
                        <div className="font-semibold text-lg">
                            {booking.flight?.departure?.airportCode || 'N/A'} ({parseCityName(booking.flight?.departure?.city, language)})
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Destination</label>
                        <div className="font-semibold text-lg">
                            {booking.flight?.arrival?.airportCode || 'N/A'} ({parseCityName(booking.flight?.arrival?.city, language)})
                        </div>
                    </div>
                </div>
            </div>

            {/* Flight Segment Highlight */}
            <div className="bg-blue-100 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-red-500 text-xl">✈</span>
                        <div>
                            <span className="font-semibold">{booking.flight?.airline || 'N/A'}</span>
                            <span className="ml-2">{booking.flight?.arrival?.airportCode || 'N/A'} ({parseCityName(booking.flight?.arrival?.city, language)})</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold">
                            {booking.flight?.arrival?.dateTime ? formatDate(booking.flight.arrival.dateTime, { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'long'
                            }) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Stop Time: 1h 15m</div>
                    </div>
                </div>
            </div>

            {/* Detailed Flight Information */}
            <div className="p-4">
                <div className="grid grid-cols-3 gap-6 text-sm">
                    {/* Left Column */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Time</label>
                            <div className="font-semibold">
                                {booking.flight?.departure?.dateTime ? formatDate(booking.flight.departure.dateTime, { 
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                }) : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Cabin class</label>
                            <div className="font-semibold">{booking.flight?.flightClass || 'N/A'}</div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Airline</label>
                            <div className="flex items-center space-x-2">
                                <span className="text-red-500">✈</span>
                                <span className="font-semibold">{booking.flight?.airline || 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Payment</label>
                            <div className="font-semibold">Online Payment</div>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Date</label>
                            <div className="font-semibold">
                                {booking.flight?.departure?.dateTime ? formatDate(booking.flight.departure.dateTime, { 
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Baggage</label>
                            <div className="font-semibold">26 KG free</div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Issue Time</label>
                            <div className="font-semibold">
                                {booking.bookingDate ? formatDate(booking.bookingDate, { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Issue Place</label>
                            <div className="font-semibold">trevel.com</div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Ticket number</label>
                            <div className="font-semibold font-mono">{booking.id}</div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Flight number</label>
                            <div className="font-semibold font-mono">{booking.flight?.flightNumber || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Information */}
            {withPrice && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg text-green-600">
                            {formatNumber(finalPrice)} {t('flightCard.currency')}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Footer with Agency Information */}
            <div className="bg-gray-100 p-4 border-t-2 border-blue-500">
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">آدرس آژانس:</h3>
                        <p className="text-gray-600">تهران، خیابان ولیعصر، پلاک 123</p>
                        <p className="text-gray-600">کد پستی: 1234567890</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">تماس با ما:</h3>
                        <p className="text-gray-600">تلفن: 021-12345678</p>
                        <p className="text-gray-600">موبایل: 09123456789</p>
                        <p className="text-gray-600">ایمیل: info@trevel.com</p>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-300 text-center">
                    <p className="text-gray-500 text-xs">
                        {t('profile.myBookings.footerMessage') || 'این بلیط معتبر است و قابل استفاده می‌باشد.'}
                    </p>
                </div>
            </div>
        </div>
    );
});

PrintableTicket.displayName = 'PrintableTicket';
