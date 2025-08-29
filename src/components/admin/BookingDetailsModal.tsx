

import React, { useState, useEffect, useRef } from 'react';
import type { Booking, PassengerDetails, FlightEndpoint, Flight, AirportInfo, AirlineInfo, AircraftInfo, FlightClassInfo } from '@/types';
import { BookingStatus, Gender, Nationality } from '@/types';
import { FlightSummaryCard } from '@/components/FlightSummaryCard';
import { EmailIcon } from '@/components/icons/EmailIcon';
import { SmsIcon } from '@/components/icons/SmsIcon';
import { WhatsappIcon } from '@/components/icons/WhatsappIcon';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
import { useLocalization } from '@/hooks/useLocalization';
import { PrintableTicket } from '@/components/PrintableTicket';
import { EditIcon } from '@/components/icons/EditIcon';


declare var html2pdf: any;

interface BookingDetailsModalProps {
    booking: Booking;
    onClose: () => void;
    onUpdateBooking: (booking: Booking) => void;
    airports: AirportInfo[];
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, onUpdateBooking, airports, airlines, aircrafts, flightClasses }) => {
    const { t, formatDate, formatNumber, language } = useLocalization();
    const [sendChannels, setSendChannels] = useState({ email: true, sms: false, whatsapp: false });
    const [ticketToPrint, setTicketToPrint] = useState<{ booking: Booking, withPrice: boolean } | null>(null);
    const ticketElementRef = useRef<HTMLDivElement>(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedBooking, setEditedBooking] = useState<Booking>(booking);

    useEffect(() => {
        setEditedBooking(booking);
    }, [booking]);

    useEffect(() => {
        if (ticketToPrint && ticketElementRef.current) {
            const element = ticketElementRef.current;
            const filename = `ticket-${ticketToPrint.booking.id}.pdf`;
            const opt = { margin: 0.5, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } };
            html2pdf().from(element).set(opt).save().then(() => { setTicketToPrint(null); });
        }
    }, [ticketToPrint]);

    const handleSendTicket = () => {
        const channels = Object.entries(sendChannels).filter(([, value]) => value).map(([key]) => t(`dashboard.bookings.detailsModal.sendVia.${key}`)).join(` ${t('general.and')} `);
        if (channels) alert(t('dashboard.bookings.detailsModal.sendSuccess', channels));
        else alert(t('dashboard.bookings.detailsModal.sendError'));
    };

    const handleStatusChange = (status: BookingStatus) => {
        onUpdateBooking({ ...booking, status });
    };

    const handleDownloadTicket = (withPrice: boolean) => {
        setTicketToPrint({ booking: booking, withPrice });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedBooking(booking);
    };

    const handleSaveChanges = () => {
        onUpdateBooking(editedBooking);
        setIsEditing(false);
    };
    
    const handleFlightChange = (field: keyof Flight, value: any) => {
        setEditedBooking(prev => ({ ...prev, flight: { ...prev.flight, [field]: value } }));
    };

    const handleEndpointChange = (endpoint: 'departure' | 'arrival', field: keyof FlightEndpoint, value: string) => {
        setEditedBooking(prev => ({ ...prev, flight: { ...prev.flight, [endpoint]: { ...prev.flight[endpoint], [field]: value } } }));
    };
    
    const handleAirportChange = (endpoint: 'departure' | 'arrival', iata: string) => {
        const airport = airports.find(a => a.iata === iata);
        if (airport) {
            setEditedBooking(prev => ({
                ...prev,
                flight: { ...prev.flight, [endpoint]: { ...prev.flight[endpoint], city: airport.city[language], airportCode: airport.iata, airportName: airport.name[language] } }
            }));
        }
    };

    const handlePassengerChange = (type: 'adults' | 'children' | 'infants', index: number, field: keyof PassengerDetails, value: any) => {
        setEditedBooking(prev => {
            const updatedPassengersOfType = [...prev.passengers[type]];
            updatedPassengersOfType[index] = { ...updatedPassengersOfType[index], [field]: value };
            return { ...prev, passengers: { ...prev.passengers, [type]: updatedPassengersOfType } };
        });
    };
    
    const toDateTimeLocal = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };

    const fromDateTimeLocal = (localString: string) => new Date(localString).toISOString();

    const renderPassengerDetails = () => {
        const passengerSections = [
            { title: t('passengerDetails.adults'), data: booking.passengers.adults },
            { title: t('passengerDetails.children'), data: booking.passengers.children },
            { title: t('passengerDetails.infants'), data: booking.passengers.infants }
        ];

        return passengerSections.map(section => {
            if (section.data.length === 0) return null;
            return (
                <div key={section.title} className="mt-4">
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">{section.title}</h4>
                    <div className="space-y-3">
                        {section.data.map((p, index) => (
                            <div key={index} className="bg-slate-50 rounded-lg p-3 border">
                                <p className="font-bold text-primary mb-2">{section.title} {index + 1}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="font-semibold text-slate-500">{t('bookingReview.name')}:</div> <div className="text-slate-800">{p.firstName} {p.lastName}</div>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.gender')}:</div> <div className="text-slate-800">{p.gender === Gender.Male ? t('passengerDetails.male') : t('passengerDetails.female')}</div>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.nationality')}:</div> <div className="text-slate-800">{p.nationality === Nationality.Iranian ? t('passengerDetails.iranian') : t('passengerDetails.foreign')}</div>
                                    {p.nationalId && <><div className="font-semibold text-slate-500">{t('bookingReview.nationalId')}:</div> <div className="text-slate-800">{p.nationalId}</div></>}
                                    {p.passportNumber && <><div className="font-semibold text-slate-500">{t('bookingReview.passportNumber')}:</div> <div className="text-slate-800">{p.passportNumber}</div></>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    const renderEditForm = () => (
        <form className="space-y-6">
            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.mainInfo')}</legend>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={editedBooking.flight.flightNumber} onChange={e => handleFlightChange('flightNumber', e.target.value)} placeholder={t('dashboard.flights.flightNumber')} className="p-2 border rounded" />
                    <select value={editedBooking.flight.airline} onChange={e => handleFlightChange('airline', e.target.value)} className="p-2 border rounded bg-white">
                        {airlines.map(a => <option key={a.id} value={a.name[language]}>{a.name[language]}</option>)}
                    </select>
                    <select value={editedBooking.flight.aircraft} onChange={e => handleFlightChange('aircraft', e.target.value)} className="p-2 border rounded bg-white">
                        {aircrafts.map(a => <option key={a.id} value={a.name[language]}>{a.name[language]}</option>)}
                    </select>
                    <select value={editedBooking.flight.flightClass} onChange={e => handleFlightChange('flightClass', e.target.value)} className="p-2 border rounded bg-white">
                        {flightClasses.map(fc => <option key={fc.id} value={fc.name[language]}>{fc.name[language]}</option>)}
                    </select>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.departure')}</legend>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={editedBooking.flight.departure.airportCode} onChange={e => handleAirportChange('departure', e.target.value)} className="p-2 border rounded bg-white">
                        {airports.map(a => <option key={a.id} value={a.iata}>{a.city[language]} ({a.iata})</option>)}
                    </select>
                    <input type="datetime-local" value={toDateTimeLocal(editedBooking.flight.departure.dateTime)} onChange={e => handleEndpointChange('departure', 'dateTime', fromDateTimeLocal(e.target.value))} className="p-2 border rounded" />
                </div>
            </fieldset>

             <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.arrival')}</legend>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={editedBooking.flight.arrival.airportCode} onChange={e => handleAirportChange('arrival', e.target.value)} className="p-2 border rounded bg-white">
                        {airports.map(a => <option key={a.id} value={a.iata}>{a.city[language]} ({a.iata})</option>)}
                    </select>
                    <input type="datetime-local" value={toDateTimeLocal(editedBooking.flight.arrival.dateTime)} onChange={e => handleEndpointChange('arrival', 'dateTime', fromDateTimeLocal(e.target.value))} className="p-2 border rounded" />
                </div>
            </fieldset>

             <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">{t('dashboard.bookings.detailsModal.passengers')}</h4>
                {['adults', 'children', 'infants'].map(type => 
                    editedBooking.passengers[type as keyof typeof editedBooking.passengers].map((p, index) => (
                        <fieldset key={`${type}-${index}`} className="border p-3 rounded-lg mb-3">
                            <legend className="px-2 text-sm font-semibold">{t(`passengerDetails.${type}` as any)} {index + 1}</legend>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <input value={p.firstName} onChange={e => handlePassengerChange(type as any, index, 'firstName', e.target.value)} placeholder={t('passengerDetails.firstName')} className="p-2 border rounded" />
                                <input value={p.lastName} onChange={e => handlePassengerChange(type as any, index, 'lastName', e.target.value)} placeholder={t('passengerDetails.lastName')} className="p-2 border rounded" />
                                <select value={p.gender} onChange={e => handlePassengerChange(type as any, index, 'gender', e.target.value)} className="p-2 border rounded bg-white">
                                    <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                                    <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                                </select>
                                <input value={p.nationalId || p.passportNumber} onChange={e => handlePassengerChange(type as any, index, p.nationality === Nationality.Iranian ? 'nationalId' : 'passportNumber', e.target.value)} placeholder={t('bookingReview.idNumber')} className="p-2 border rounded" />
                            </div>
                        </fieldset>
                    ))
                )}
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                    {ticketToPrint && <PrintableTicket ref={ticketElementRef} booking={ticketToPrint.booking} withPrice={ticketToPrint.withPrice} t={t} formatDate={formatDate} formatNumber={formatNumber} language={language} />}
                </div>

                <div className="px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl leading-6 font-bold text-primary">{t('dashboard.bookings.detailsModal.title', booking.id)}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t('dashboard.bookings.detailsModal.agent', booking.user.name, booking.user.email)}</p>
                        </div>
                         <div className="flex items-center gap-2">
                             {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition" title={t('dashboard.general.edit')}>
                                    <EditIcon className="w-5 h-5" />
                                </button>
                             )}
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                         </div>
                    </div>

                    <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
                        {isEditing ? renderEditForm() : (
                           <>
                                <FlightSummaryCard flight={booking.flight} />
                                <div className="mt-6"><h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.bookings.detailsModal.passengers')}</h3>{renderPassengerDetails()}</div>
                                
                                {(booking.buyerReference || booking.notes) && (
                                    <div className="mt-6">
                                        <div className="bg-slate-50 rounded-lg p-3 border text-sm space-y-2">
                                            {booking.buyerReference && (
                                                <p><strong className="font-semibold text-slate-600">{t('dashboard.bookings.detailsModal.buyerReference')}:</strong> {booking.buyerReference}</p>
                                            )}
                                            {booking.notes && (
                                                <p><strong className="font-semibold text-slate-600">{t('dashboard.bookings.detailsModal.notes')}:</strong> {booking.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">{t('dashboard.bookings.detailsModal.sendTicketTitle')}</h3>
                                    <div className="bg-slate-50 rounded-lg p-4 border space-y-3">
                                        <p className="text-sm text-slate-600">{t('dashboard.bookings.detailsModal.sendTicketSubtitle')}</p>
                                        <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                                <input type="checkbox" checked={sendChannels.email} onChange={e => setSendChannels(s => ({...s, email: e.target.checked}))} className="rounded text-primary focus:ring-accent" />
                                                <EmailIcon className="w-5 h-5 text-slate-500" /><span>{t('dashboard.bookings.detailsModal.sendVia.email')}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                                <input type="checkbox" checked={sendChannels.sms} onChange={e => setSendChannels(s => ({...s, sms: e.target.checked}))} className="rounded text-primary focus:ring-accent" />
                                                <SmsIcon className="w-5 h-5 text-slate-500" /><span>{t('dashboard.bookings.detailsModal.sendVia.sms')}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                                <input type="checkbox" checked={sendChannels.whatsapp} onChange={e => setSendChannels(s => ({...s, whatsapp: e.target.checked}))} className="rounded text-primary focus:ring-accent" />
                                                <WhatsappIcon className="w-5 h-5 text-slate-500" /><span>{t('dashboard.bookings.detailsModal.sendVia.whatsapp')}</span>
                                            </label>
                                        </div>
                                        <div className="pt-2">
                                            <button onClick={handleSendTicket} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">{t('dashboard.bookings.detailsModal.send')}</button>
                                        </div>
                                    </div>
                                </div>
                                 <div className="mt-6">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">{t('dashboard.bookings.detailsModal.downloadTicketTitle')}</h3>
                                     <div className="flex items-center gap-4">
                                        <button onClick={() => handleDownloadTicket(true)} className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition text-sm">
                                            <DownloadIcon className="w-5 h-5" />
                                            <span>{t('dashboard.bookings.detailsModal.downloadWithPrice')}</span>
                                        </button>
                                        <button onClick={() => handleDownloadTicket(false)} className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition text-sm">
                                             <DownloadIcon className="w-5 h-5" />
                                             <span>{t('dashboard.bookings.detailsModal.downloadWithoutPrice')}</span>
                                        </button>
                                     </div>
                                 </div>
                           </>
                        )}
                    </div>
                </div>
                 <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center gap-4">
                    {isEditing ? (
                        <>
                             <button onClick={handleSaveChanges} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover sm:w-auto sm:text-sm">{t('dashboard.general.save')}</button>
                             <button onClick={handleCancelEdit} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">{t('dashboard.general.cancel')}</button>
                        </>
                    ) : (
                        <>
                            <div className="flex-grow text-sm text-right">
                                <span className="font-semibold">{t('dashboard.bookings.detailsModal.currentStatus')}</span>{' '}
                                <span className={`font-bold ${booking.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-600'}`}>{t(`dashboard.bookings.statusValues.${booking.status}`)}</span>
                            </div>
                            {booking.status === 'CONFIRMED' && (
                                <button onClick={() => handleStatusChange('CANCELLED')} className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 sm:w-auto sm:text-sm">{t('dashboard.bookings.detailsModal.cancelBooking')}</button>
                            )}
                            {booking.status === 'CANCELLED' && (
                                <button onClick={() => handleStatusChange('CONFIRMED')} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:w-auto sm:text-sm">{t('dashboard.bookings.detailsModal.reconfirmBooking')}</button>
                            )}
                        </>
                    )}
                 </div>
            </div>
        </div>
    );
};