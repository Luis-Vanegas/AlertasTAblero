import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(apiKey: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socketUrl = import.meta.env.VITE_SOCKET_URL;

      if (!socketUrl) {
        console.warn('VITE_SOCKET_URL no configurado, usando polling como fallback');
        reject(new Error('Socket URL no configurado'));
        return;
      }

      this.socket = io(socketUrl, {
        auth: {
          'x-api-key': apiKey,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        toast.success('Conectado en tiempo real');
        resolve(this.socket!);
      });

      this.socket.on('disconnect', reason => {
        if (reason === 'io server disconnect') {
          // El servidor desconectó, intentar reconectar manualmente
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', error => {
        console.error('❌ Error de conexión socket:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          toast.error('No se pudo conectar al servidor en tiempo real');
          reject(error);
        }
      });

      this.socket.on('reconnect', () => {
        toast.success('Reconectado en tiempo real');
      });

      this.socket.on('reconnect_error', error => {
        console.error('❌ Error de reconexión:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Falló la reconexión al socket');
        toast.error('Conexión en tiempo real perdida');
      });

      // Timeout de conexión
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Timeout de conexión al socket'));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      // Debug removido
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Eventos específicos para alertas
  onAlertCreate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('alert:create', data => {
        callback(data);

        // Mostrar toast para alertas críticas
        if (data.severity === 'critical' || data.gravedad === 'alta') {
          toast.error(`🚨 Alerta Crítica: ${data.nombre_obra || data.obra}`, {
            duration: 6000,
          });
        }
      });
    }
  }

  onAlertUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('alert:update', data => {
        callback(data);
      });
    }
  }

  onAlertDelete(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('alert:delete', data => {
        callback(data);
      });
    }
  }

  // Remover listeners específicos
  offAlertCreate(): void {
    if (this.socket) {
      this.socket.off('alert:create');
    }
  }

  offAlertUpdate(): void {
    if (this.socket) {
      this.socket.off('alert:update');
    }
  }

  offAlertDelete(): void {
    if (this.socket) {
      this.socket.off('alert:delete');
    }
  }

  // Emitir eventos (si es necesario)
  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  // Obtener estadísticas de conexión
  getConnectionStats() {
    return {
      connected: this.isConnected(),
      id: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Instancia singleton
export const socketService = new SocketService();

// Hook para usar el socket en componentes React
export const useSocket = () => {
  return {
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    isConnected: socketService.isConnected.bind(socketService),
    onAlertCreate: socketService.onAlertCreate.bind(socketService),
    onAlertUpdate: socketService.onAlertUpdate.bind(socketService),
    onAlertDelete: socketService.onAlertDelete.bind(socketService),
    offAlertCreate: socketService.offAlertCreate.bind(socketService),
    offAlertUpdate: socketService.offAlertUpdate.bind(socketService),
    offAlertDelete: socketService.offAlertDelete.bind(socketService),
    emit: socketService.emit.bind(socketService),
    getConnectionStats: socketService.getConnectionStats.bind(socketService),
  };
};
