import React, { createContext, useContext, useCallback } from 'react'
import { useSnackbar } from 'notistack'
import toast from 'react-hot-toast'

export interface NotificationContextType {
  showSuccess: (message: string, options?: NotificationOptions) => void
  showError: (message: string, options?: NotificationOptions) => void
  showWarning: (message: string, options?: NotificationOptions) => void
  showInfo: (message: string, options?: NotificationOptions) => void
  showCriticalAlert: (message: string, action?: () => void) => void
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  notifications: any[]
}

export interface NotificationOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const showSuccess = useCallback((message: string, options?: NotificationOptions) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: options?.duration || 4000,
      action: options?.action ? (snackbarId) => (
        <button
          onClick={() => {
            options.action!.onClick()
            closeSnackbar(snackbarId)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
        >
          {options.action!.label}
        </button>
      ) : undefined,
      persist: options?.persistent || false,
    })
  }, [enqueueSnackbar, closeSnackbar])

  const showError = useCallback((message: string, options?: NotificationOptions) => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: options?.duration || 6000,
      action: options?.action ? (snackbarId) => (
        <button
          onClick={() => {
            options.action!.onClick()
            closeSnackbar(snackbarId)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
        >
          {options.action!.label}
        </button>
      ) : undefined,
      persist: options?.persistent || false,
    })
  }, [enqueueSnackbar, closeSnackbar])

  const showWarning = useCallback((message: string, options?: NotificationOptions) => {
    enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: options?.duration || 5000,
      action: options?.action ? (snackbarId) => (
        <button
          onClick={() => {
            options.action!.onClick()
            closeSnackbar(snackbarId)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
        >
          {options.action!.label}
        </button>
      ) : undefined,
      persist: options?.persistent || false,
    })
  }, [enqueueSnackbar, closeSnackbar])

  const showInfo = useCallback((message: string, options?: NotificationOptions) => {
    enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: options?.duration || 4000,
      action: options?.action ? (snackbarId) => (
        <button
          onClick={() => {
            options.action!.onClick()
            closeSnackbar(snackbarId)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
        >
          {options.action!.label}
        </button>
      ) : undefined,
      persist: options?.persistent || false,
    })
  }, [enqueueSnackbar, closeSnackbar])

  const showCriticalAlert = useCallback((message: string, action?: () => void) => {
    // Usar toast para alertas críticas con animación especial
    toast.error(message, {
      duration: 8000,
      style: {
        background: '#d32f2f',
        color: 'white',
        border: '2px solid #ffcdd2',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '🚨',
      // action: action ? {
      //   label: 'Ver detalles',
      //   onClick: action,
      // } : undefined,
    })

    // También mostrar en snackbar para persistencia
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 8000,
      action: action ? (snackbarId) => (
        <button
          onClick={() => {
            action()
            closeSnackbar(snackbarId)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px',
            fontWeight: 'bold',
          }}
        >
          Ver detalles
        </button>
      ) : undefined,
      persist: true,
    })
  }, [enqueueSnackbar, closeSnackbar])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const toastOptions = {
      duration: 4000,
      style: {
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions)
        break
      case 'error':
        toast.error(message, toastOptions)
        break
      case 'warning':
        toast(message, { ...toastOptions, icon: '⚠️' })
        break
      default:
        toast(message, toastOptions)
    }
  }, [])

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCriticalAlert,
    showToast,
    notifications: [], // Array vacío por ahora, se puede implementar un sistema de notificaciones persistente
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
