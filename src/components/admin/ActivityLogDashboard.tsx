import React, { useState, useMemo } from 'react';
import type { ActivityLog } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

export const ActivityLogDashboard: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { t, formatDate } = useLocalization();

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return logs.filter(log =>
            log.user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            log.action.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [logs, searchTerm]);

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.activityLog.title')}</h2>
                <div className="w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder={t('dashboard.activityLog.searchHint')}
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
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.activityLog.user')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.activityLog.action')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.activityLog.timestamp')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.action}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    {searchTerm ? t('dashboard.general.notFoundWithSearch') : t('dashboard.general.notFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};