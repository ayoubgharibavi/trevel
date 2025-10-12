import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    console.log('🔍 DEBUG - addNotification called with:', notification);
    const id = Math.random().toString(36).substr(2, 9);
    
    // Ensure all notification properties are safe strings
    const safeNotification = {
      ...notification,
      id,
      title: typeof notification.title === 'string' ? notification.title : JSON.stringify(notification.title),
      message: typeof notification.message === 'string' ? notification.message : JSON.stringify(notification.message),
      duration: notification.duration || 5000,
    };
    
    console.log('🔍 DEBUG - safeNotification:', safeNotification);
    console.log('🔍 DEBUG - safeNotification.title type:', typeof safeNotification.title);
    console.log('🔍 DEBUG - safeNotification.message type:', typeof safeNotification.message);
    console.log('🔍 DEBUG - safeNotification.title is object:', typeof safeNotification.title === 'object');
    console.log('🔍 DEBUG - safeNotification.message is object:', typeof safeNotification.message === 'object');
    setNotifications(prev => [...prev, safeNotification]);

    // Auto remove notification after duration
    if (safeNotification.duration && safeNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, safeNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    console.log('🔍 DEBUG - showSuccess called with:', { title, message, duration });
    console.log('🔍 DEBUG - title type:', typeof title);
    console.log('🔍 DEBUG - message type:', typeof message);
    console.log('🔍 DEBUG - message is object:', typeof message === 'object');
    console.log('🔍 DEBUG - message stringified:', JSON.stringify(message));
    // Ensure message is always a string
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    console.log('🔍 DEBUG - safeMessage:', safeMessage);
    addNotification({ type: 'success', title, message: safeMessage, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    console.log('🔍 DEBUG - showError called with:', { title, message, duration });
    console.log('🔍 DEBUG - title type:', typeof title);
    console.log('🔍 DEBUG - message type:', typeof message);
    console.log('🔍 DEBUG - message is object:', typeof message === 'object');
    console.log('🔍 DEBUG - message stringified:', JSON.stringify(message));
    // Ensure message is always a string
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    console.log('🔍 DEBUG - safeMessage:', safeMessage);
    console.log('🔍 DEBUG - safeMessage type:', typeof safeMessage);
    console.log('🔍 DEBUG - safeMessage is object:', typeof safeMessage === 'object');
    addNotification({ type: 'error', title, message: safeMessage, duration });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    // Ensure message is always a string
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    addNotification({ type: 'warning', title, message: safeMessage, duration });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    // Ensure message is always a string
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    addNotification({ type: 'info', title, message: safeMessage, duration });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  console.log('🔍 DEBUG - NotificationItem rendering:', notification);
  console.log('🔍 DEBUG - notification.title type:', typeof notification.title);
  console.log('🔍 DEBUG - notification.message type:', typeof notification.message);
  console.log('🔍 DEBUG - notification.title is object:', typeof notification.title === 'object');
  console.log('🔍 DEBUG - notification.message is object:', typeof notification.message === 'object');
  
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getNotificationStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">
            {typeof notification.title === 'string' ? notification.title : JSON.stringify(notification.title)}
          </p>
          <p className="mt-1 text-sm">
            {typeof notification.message === 'string' ? notification.message : JSON.stringify(notification.message)}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
            onClick={() => onRemove(notification.id)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
