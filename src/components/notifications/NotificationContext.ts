import { createContext } from 'react';

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

export interface NotificationContextType {
  showSuccess: (message: string, options?: NotificationOptions) => void;
  showError: (message: string, options?: NotificationOptions) => void;
  showWarning: (message: string, options?: NotificationOptions) => void;
  showInfo: (message: string, options?: NotificationOptions) => void;
  showCriticalAlert: (message: string, action?: () => void) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  notifications: unknown[];
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
