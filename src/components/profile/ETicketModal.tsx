import React, { useState, useEffect, useRef } from 'react';
import type { Booking } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { PrintableTicket } from '@/components/PrintableTicket';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
import { apiService } from '@/services/apiService';
// PDF functionality will use browser print and backend API

interface ETicketModalProps {
    booking: Booking;
    onClose: () => void;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({ booking, onClose }) => {
    const { t, formatDate, formatNumber, language } = useLocalization();
    const [ticketToPrint, setTicketToPrint] = useState<{ booking: Booking, withPrice: boolean } | null>(null);
    const ticketElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ticketToPrint && ticketElementRef.current) {
            const element = ticketElementRef.current;
            const filename = `ticket-${ticketToPrint.booking.id}.pdf`;
            const opt = { margin: 0.5, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } };
            // Use browser print for PDF generation
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>بلیط الکترونیکی - ${ticketToPrint.booking.id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                            .ticket { border: 2px solid #333; padding: 20px; max-width: 600px; margin: 0 auto; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .info { margin: 10px 0; padding: 5px; border-bottom: 1px dotted #ccc; }
                            @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${element.innerHTML}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
                setTicketToPrint(null);
            }
        }
    }, [ticketToPrint]);

    const handleDownloadTicket = (withPrice: boolean) => {
        // Always use client-side generation since backend PDF is disabled
        setTicketToPrint({ booking: booking, withPrice });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                {ticketToPrint && <PrintableTicket ref={ticketElementRef} booking={ticketToPrint.booking} withPrice={ticketToPrint.withPrice} t={t} formatDate={formatDate} formatNumber={formatNumber} language={language} />}
            </div>
            <div className="bg-white rounded-lg shadow-xl transform transition-all w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-primary">{t('profile.myBookings.eTicketTitle')}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleDownloadTicket(true)} className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition text-sm">
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t('profile.myBookings.downloadWithPrice')}</span>
                        </button>
                         <button onClick={() => handleDownloadTicket(false)} className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition text-sm">
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t('profile.myBookings.downloadWithoutPrice')}</span>
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="p-2 bg-slate-100 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-center">
                       <PrintableTicket 
                           booking={booking} 
                           withPrice={true}
                           t={t}
                           formatDate={formatDate}
                           formatNumber={formatNumber}
                           language={language}
                       />
                    </div>
                </div>
            </div>
        </div>
    );
};