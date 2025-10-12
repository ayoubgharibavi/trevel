
import React, { useState } from 'react';
import type { Ticket, TicketMessage } from '@/types';
import { TicketStatus, TicketPriority, User } from '@/types';
import { UserIcon } from '@/components/icons/UserIcon';
import { CogIcon } from '@/components/icons/CogIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface TicketDetailsModalProps {
    ticket: Ticket;
    adminUser: User;
    onClose: () => void;
    onUpdateTicket: (ticket: Ticket) => void;
    onAddMessage: (ticketId: string, message: TicketMessage) => Promise<void>;
}

const MessageBubble: React.FC<{ message: TicketMessage; formatDate: (date: string, options?: any) => string }> = ({ message, formatDate }) => {
    const isAdmin = message.author === 'ADMIN';
    return (
        <div className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-3 max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {isAdmin ? <CogIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div className={`p-3 rounded-lg ${isAdmin ? 'bg-primary text-white rounded-br-sm' : 'bg-slate-100 rounded-bl-sm'}`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-2 opacity-70 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {message.authorName} - {formatDate(message.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, adminUser, onClose, onUpdateTicket, onAddMessage }) => {
    const { t, formatDate } = useLocalization();
    const [replyText, setReplyText] = useState('');
    const [sendChannels, setSendChannels] = useState({ email: true, sms: false, whatsapp: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newMessage: TicketMessage = {
                id: `msg-${Date.now()}`,
                author: 'ADMIN',
                authorName: adminUser.name,
                text: replyText,
                timestamp: new Date().toISOString(),
            };
            
            console.log('🔍 Sending admin reply:', newMessage);
            await onAddMessage(ticket.id, newMessage);
            console.log('✅ Admin reply sent successfully');
            setReplyText('');
            
            // The parent component will update the ticket state
            // No need to update local state here
            
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TicketStatus;
        onUpdateTicket({ ...ticket, status: newStatus });
    };
    
    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPriority = e.target.value as TicketPriority;
        onUpdateTicket({ ...ticket, priority: newPriority });
    };

    const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'RESOLVED', 'PENDING_CUSTOMER', 'WAITING_FOR_SUPPORT', 'RESPONDED', 'COMPLETED'];
    const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-3xl w-full flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl leading-6 font-bold text-primary" id="modal-title">{ticket.subject}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {t('profile.myTickets.ticketFor')} {ticket.user?.name || ticket.user?.username || 'نامشخص'}
                                {ticket.bookingId && ` - ${t('dashboard.tickets.detailsModal.relatedToBooking', ticket.bookingId)}`}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-6 mt-3 text-sm">
                        <div>
                            <label htmlFor="status" className="font-medium text-slate-600 mr-2">{t('dashboard.tickets.detailsModal.status')}</label>
                            <select id="status" value={ticket.status} onChange={handleStatusChange} className="p-1 border rounded bg-white">
                                {statusOptions.map(s => <option key={s} value={s}>{t(`dashboard.tickets.statusValues.${s}`)}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="priority" className="font-medium text-slate-600 mr-2">{t('dashboard.tickets.detailsModal.priority')}</label>
                            <select id="priority" value={ticket.priority} onChange={handlePriorityChange} className="p-1 border rounded bg-white">
                               {priorityOptions.map(p => <option key={p} value={p}>{t(`dashboard.tickets.priorityValues.${p}`)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="p-6 flex-grow overflow-y-auto max-h-[50vh] space-y-4 bg-slate-50">
                    {(ticket.messages || []).map(msg => <MessageBubble key={msg.id} message={msg} formatDate={formatDate}/>)}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReply} className="px-6 py-4 border-t bg-white">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t('dashboard.tickets.detailsModal.replyPlaceholder')}
                        className="w-full p-2 border rounded-md focus:ring-accent focus:border-accent"
                        rows={3}
                        disabled={ticket.status === 'CLOSED'}
                    />
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">{t('dashboard.tickets.detailsModal.sendVia')}</span>
                             <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={sendChannels.email} onChange={e => setSendChannels(s => ({...s, email: e.target.checked}))} className="rounded text-primary" />
                                {t('dashboard.bookings.detailsModal.sendVia.email')}
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={sendChannels.sms} onChange={e => setSendChannels(s => ({...s, sms: e.target.checked}))} className="rounded text-primary" />
                                {t('dashboard.bookings.detailsModal.sendVia.sms')}
                            </label>
                             <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={sendChannels.whatsapp} onChange={e => setSendChannels(s => ({...s, whatsapp: e.target.checked}))} className="rounded text-primary" />
                               {t('dashboard.bookings.detailsModal.sendVia.whatsapp')}
                            </label>
                        </div>
                         <button type="submit" disabled={ticket.status === 'CLOSED' || !replyText.trim() || isSubmitting} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition disabled:opacity-50">
                            {isSubmitting ? t('dashboard.tickets.detailsModal.sending') : t('dashboard.tickets.detailsModal.sendReply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
