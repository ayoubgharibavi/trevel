
import React, { useState, useMemo } from 'react';
import type { Ticket, Booking } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { CreateTicketModal } from './CreateTicketModal';
import { UserTicketModal } from './UserTicketModal';

interface MyTicketsSectionProps {
    tickets: Ticket[];
    userBookings: Booking[];
    onCreateTicket: (subject: string, message: string, bookingId?: string) => void;
    onAddMessage: (ticketId: string, messageText: string) => void;
}

const StatusBadge: React.FC<{ status: Ticket['status'] }> = ({ status }) => {
    const { t } = useLocalization();
    const statusMap = {
        OPEN: { classes: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { classes: 'bg-yellow-100 text-yellow-800' },
        CLOSED: { classes: 'bg-gray-100 text-gray-800' },
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusMap[status].classes}`}>{t(`dashboard.tickets.statusValues.${status}`)}</span>;
};


export const MyTicketsSection: React.FC<MyTicketsSectionProps> = ({ tickets, userBookings, onCreateTicket, onAddMessage }) => {
    const { t, formatDate } = useLocalization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

    const sortedTickets = useMemo(() => {
        return [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [tickets]);

    const handleCreateTicket = (subject: string, message: string, bookingId?: string) => {
        onCreateTicket(subject, message, bookingId);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('profile.myTickets.title')}</h2>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('profile.myTickets.newTicket')}</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                {sortedTickets.length > 0 ? (
                     <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('profile.myTickets.ticketId')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('profile.myTickets.subject')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('profile.myTickets.lastUpdate')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('profile.myTickets.status')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('profile.myTickets.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {sortedTickets.map(ticket => (
                               <tr key={ticket.id}>
                                   <td className="px-4 py-3 font-mono text-slate-500">{ticket.id}</td>
                                   <td className="px-4 py-3 font-medium text-slate-800">{ticket.subject}</td>
                                   <td className="px-4 py-3 text-slate-600">{formatDate(ticket.updatedAt, {dateStyle: 'short', timeStyle: 'short'})}</td>
                                   <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                                   <td className="px-4 py-3 text-left">
                                       <button onClick={() => setViewingTicket(ticket)} className="text-primary font-semibold hover:underline">
                                           {t('profile.myTickets.view')}
                                       </button>
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>{t('profile.myTickets.noTickets')}</p>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <CreateTicketModal
                    userBookings={userBookings}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateTicket}
                />
            )}
            
            {viewingTicket && (
                <UserTicketModal
                    ticket={viewingTicket}
                    onClose={() => setViewingTicket(null)}
                    onAddMessage={onAddMessage}
                />
            )}
        </div>
    );
};
