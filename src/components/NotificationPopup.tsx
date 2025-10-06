import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { XIcon } from './icons/XIcon';

interface NotificationPopupProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
    duration?: number;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ 
    type, 
    message, 
    onClose, 
    duration = 5000 
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

    return (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
            <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {type === 'success' ? (
                            <CheckCircleIcon className={`w-6 h-6 ${iconColor}`} />
                        ) : (
                            <AlertTriangleIcon className={`w-6 h-6 ${iconColor}`} />
                        )}
                    </div>
                    <div className="mr-3 flex-1">
                        <p className={`text-sm font-medium ${textColor}`}>
                            {message}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={onClose}
                            className={`${textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'success' ? 'green' : 'red'}-50 focus:ring-${type === 'success' ? 'green' : 'red'}-600 rounded-md`}
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
