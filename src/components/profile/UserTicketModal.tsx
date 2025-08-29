
import React, { useState, useEffect, useRef } from 'react';
import type { Ticket, TicketMessage } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { UserIcon } from '@/components/icons/UserIcon';
import { CogIcon } from '@/components/icons/CogIcon';

interface UserTicketModalProps {
    ticket: Ticket;
    onClose: () => void;
    onAddMessage: (ticketId: string, messageText: string) => void;
}

const MessageBubble: React.FC<{ message: TicketMessage; formatDate: (date: string, options?: any) => string }> = ({ message, formatDate }) => {
    const isAdmin = message.author === 'ADMIN';
    return (
        <div className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                {isAdmin ? <CogIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
            </div>
            <div className={`p-3 rounded-lg max-w-lg ${isAdmin ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-2 opacity-70 ${isAdmin ? 'text-right' : 'text-left'}`}>
                    {message.authorName} - {formatDate(message.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
                </p>
            </div>
        </div>
    );
};

export const UserTicketModal: React.FC<UserTicketModalProps> = ({ ticket, onClose, onAddMessage }) => {
    const { t, formatDate } = useLocalization();
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket.messages]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onAddMessage(ticket.id, replyText);
        setReplyText('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <div>
                         <h3 className="text-lg font-bold text-primary">{t('profile.myTickets.userTicketModal.title')} - {ticket.subject}</h3>
                         <p className="text-xs text-slate-500 font-mono">{ticket.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto space-y-4 bg-slate-100">
                    {ticket.messages.map(msg => <MessageBubble key={msg.id} message={msg} formatDate={formatDate} />)}
                    <div ref={messagesEndRef} />
                </div>

                {ticket.status !== 'CLOSED' && (
                    <form onSubmit={handleReply} className="p-4 border-t bg-white flex items-center gap-3">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('profile.myTickets.userTicketModal.replyPlaceholder')}
                            className="flex-grow p-2 border rounded-md"
                            rows={2}
                        />
                        <button type="submit" disabled={!replyText.trim()} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition disabled:opacity-50">
                            {t('profile.myTickets.userTicketModal.sendReply')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
