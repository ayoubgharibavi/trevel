
import React, { useState, useMemo } from 'react';
import type { Ticket, TicketMessage, User } from '@/types';
import { TicketDetailsModal } from './TicketDetailsModal';
import { useLocalization } from '@/hooks/useLocalization';

interface TicketsDashboardProps {
    tickets: Ticket[];
    adminUser: User;
    onUpdateTicket: (ticket: Ticket) => void;
    onAddMessage: (ticketId: string, message: TicketMessage) => Promise<void>;
}

const StatusBadge: React.FC<{ status: Ticket['status'] }> = ({ status }) => {
    const { t } = useLocalization();
    const statusMap = {
        OPEN: { classes: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { classes: 'bg-yellow-100 text-yellow-800' },
        CLOSED: { classes: 'bg-gray-100 text-gray-800' },
        RESOLVED: { classes: 'bg-green-100 text-green-800' },
        PENDING_CUSTOMER: { classes: 'bg-orange-100 text-orange-800' },
        WAITING_FOR_SUPPORT: { classes: 'bg-purple-100 text-purple-800' },
        RESPONDED: { classes: 'bg-green-100 text-green-800' },
        COMPLETED: { classes: 'bg-emerald-100 text-emerald-800' },
    };
    const safeStatus = status || 'OPEN';
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusMap[safeStatus]?.classes || 'bg-gray-100 text-gray-800'}`}>{t(`dashboard.tickets.statusValues.${safeStatus}`)}</span>;
};

const PriorityBadge: React.FC<{ priority: Ticket['priority'] }> = ({ priority }) => {
    const { t } = useLocalization();
    const priorityMap = {
        LOW: { classes: 'text-gray-600' },
        MEDIUM: { classes: 'text-yellow-600 font-semibold' },
        HIGH: { classes: 'text-red-600 font-bold' },
        URGENT: { classes: 'text-red-800 font-bold' },
    };
    const safePriority = priority || 'MEDIUM';
    return <span className={`text-sm ${priorityMap[safePriority]?.classes || 'text-gray-600'}`}>{t(`dashboard.tickets.priorityValues.${safePriority}`)}</span>;
};

export const TicketsDashboard: React.FC<TicketsDashboardProps> = ({ tickets, adminUser, onUpdateTicket, onAddMessage }) => {
    const { t, formatDate } = useLocalization();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Update selectedTicket when tickets change to reflect latest messages
    React.useEffect(() => {
        if (selectedTicket) {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }
        }
    }, [tickets, selectedTicket]);

    const filteredTickets = useMemo(() => {
        if (!searchTerm) return tickets;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return tickets.filter(ticket =>
            ticket.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            ticket.subject.toLowerCase().includes(lowerCaseSearchTerm) ||
            (ticket.user?.name && ticket.user.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (ticket.user?.username && ticket.user.username.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [tickets, searchTerm]);

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.tickets.title')}</h2>
                 <div className="w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder={t('dashboard.tickets.searchHint')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.id')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.subject')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.user')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.priority')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.lastUpdate')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tickets.status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('dashboard.general.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTickets.map((ticket, index) => (
                            <tr key={ticket.id || `ticket-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.user?.name || ticket.user?.username || 'نامشخص'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={ticket.priority} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.updatedAt ? formatDate(ticket.updatedAt, {dateStyle: 'short', timeStyle: 'short'}) : 'نامشخص'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={ticket.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <button onClick={() => setSelectedTicket(ticket)} className="text-primary hover:text-purple-800">{t('dashboard.tickets.viewAndReply')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {selectedTicket && (
                <TicketDetailsModal
                    ticket={selectedTicket}
                    adminUser={adminUser}
                    onClose={() => setSelectedTicket(null)}
                    onUpdateTicket={onUpdateTicket}
                    onAddMessage={onAddMessage}
                />
            )}
        </div>
    );
};
