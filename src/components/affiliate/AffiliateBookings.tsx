
import React from 'react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
// PDF functionality will use browser print

interface AffiliateBookingsProps {
    bookings: Booking[];
}

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    if (status === 'CONFIRMED') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{t('dashboard.bookings.statusValues.CONFIRMED')}</span>;
    }
    if (status === 'CANCELLED') {
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{t('dashboard.bookings.statusValues.CANCELLED')}</span>;
    }
    if (status === 'REFUNDED') {
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{t('dashboard.bookings.statusValues.REFUNDED')}</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{t('dashboard.bookings.statusValues.UNKNOWN')}</span>;
};

export const AffiliateBookings: React.FC<AffiliateBookingsProps> = ({ bookings }) => {
    const { t, formatDate } = useLocalization();

    const handleExportExcel = () => {
        const headers = [
            t('affiliate.bookings.bookingId'),
            t('affiliate.bookings.flight'),
            t('affiliate.bookings.passengers'),
            t('affiliate.bookings.date'),
            t('affiliate.bookings.status'),
        ];
        const csvRows = [headers.join(',')];

        bookings.forEach(booking => {
            const flightDetails = `${booking.flight.flightNumber} (${booking.flight.departure.city} -> ${booking.flight.arrival.city})`;
            const passengers = [...booking.passengers.adults, ...booking.passengers.children, ...booking.passengers.infants]
                .map(p => `${p.firstName} ${p.lastName}`)
                .join('; ');
            const date = formatDate(booking.bookingDate);
            const status = t(`dashboard.bookings.statusValues.${booking.status}`);

            const row = [booking.id, `"${flightDetails}"`, `"${passengers}"`, date, status].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'bookings.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        // Open print dialog for PDF generation
        const printWindow = window.open('', '_blank');
        const tableElement = document.getElementById('affiliate-bookings-table');
        if (printWindow && tableElement) {
            const content = tableElement.outerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>لیست رزروها</title>
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 12px; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center;">لیست رزروها</h1>
                    <p style="text-align: center;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
                    ${content}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('affiliate.bookings.title')}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportExcel} className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg transition">
                        <DownloadIcon className="w-4 h-4" />
                        <span>{t('affiliate.bookings.exportExcel')}</span>
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg transition">
                        <DownloadIcon className="w-4 h-4" />
                        <span>{t('affiliate.bookings.exportPDF')}</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table id="affiliate-bookings-table" className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.bookings.bookingId')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.bookings.flight')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.bookings.passengers')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.bookings.date')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.bookings.status')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.length > 0 ? bookings.map(booking => {
                            const allPassengers = [...booking.passengers.adults, ...booking.passengers.children, ...booking.passengers.infants];
                            const passengerText = allPassengers.map(p => `${p.firstName} ${p.lastName}`).join(', ');
                            
                            return (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{booking.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.flight.flightNumber} ({booking.flight.departure.city} &rarr; {booking.flight.arrival.city})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{passengerText}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(booking.bookingDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    {t('dashboard.general.notFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};