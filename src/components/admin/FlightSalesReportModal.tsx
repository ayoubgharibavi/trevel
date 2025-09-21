import React, { useMemo, useRef } from 'react';
import type { Flight, Booking, User } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
// PDF functionality will use browser print

interface FlightSalesReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: Flight | null;
    bookings: Booking[];
    users: User[];
}

export const FlightSalesReportModal: React.FC<FlightSalesReportModalProps> = ({ isOpen, onClose, flight, bookings, users }) => {
    const { t, formatNumber } = useLocalization();
    const reportContentRef = useRef<HTMLDivElement>(null);

    const salesData = useMemo(() => {
        if (!flight) return { sales: [], totalSeats: 0, totalRevenue: 0 };

        const flightBookings = bookings.filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED');
        
        const salesByAgent: { [agentId: string]: { agentName: string; seats: number } } = {};

        flightBookings.forEach(booking => {
            const agentId = booking.user.id;
            const passengers = booking.passengers || { adults: [], children: [], infants: [] };
            const passengerCount = (passengers.adults?.length || 0) + (passengers.children?.length || 0) + (passengers.infants?.length || 0);
            
            if (!salesByAgent[agentId]) {
                salesByAgent[agentId] = { agentName: booking.user.name, seats: 0 };
            }
            salesByAgent[agentId].seats += passengerCount;
        });

        const sales = Object.values(salesByAgent).sort((a, b) => b.seats - a.seats);
        const totalSeats = sales.reduce((sum, s) => sum + s.seats, 0);
        const totalRevenue = totalSeats * (flight.price + flight.taxes);

        return { sales, totalSeats, totalRevenue };
    }, [flight, bookings]);

    const handleDownloadPDF = () => {
        // Open print dialog for PDF generation
        const printWindow = window.open('', '_blank');
        if (printWindow && reportContentRef.current) {
            const content = reportContentRef.current.innerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>گزارش فروش پرواز - ${flight?.flightNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center;">گزارش فروش پرواز ${flight?.flightNumber}</h1>
                    <p style="text-align: center;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
                    ${content}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (!isOpen || !flight) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-primary">{t('dashboard.flights.salesReport.title')}</h3>
                        <p className="text-sm text-slate-500">{flight.flightNumber} ({flight.departure.city} &rarr; {flight.arrival.city})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg transition">
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t('profile.myBookings.downloadPDF')}</span>
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                
                <div ref={reportContentRef} className="p-6 flex-grow overflow-y-auto">
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-800">{t('dashboard.flights.salesReport.seatsSold')}</p>
                                <p className="text-2xl font-bold text-blue-900">{formatNumber(salesData.totalSeats)}</p>
                            </div>
                             <div className="bg-green-50 p-3 rounded-md">
                                <p className="text-sm text-green-800">{t('dashboard.flights.headers.revenue')}</p>
                                <p className="text-2xl font-bold text-green-900">{formatNumber(salesData.totalRevenue)} <span className="text-lg">{t('placeholders.rial')}</span></p>
                            </div>
                        </div>
                        <div>
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-right font-medium">{t('dashboard.flights.salesReport.agency')}</th>
                                        <th className="px-4 py-2 text-left font-medium">{t('dashboard.flights.salesReport.seatsSold')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {salesData.sales.length > 0 ? salesData.sales.map((sale, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{sale.agentName}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{formatNumber(sale.seats)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={2} className="text-center py-8 text-slate-500">{t('dashboard.flights.salesReport.noSales')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300">{t('dashboard.general.cancel')}</button>
                </div>
            </div>
        </div>
    );
};
