import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        import.meta.env.VITE_API_BASE ||
        'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para añadir API key
    this.client.interceptors.request.use(
      config => {
        const apiKey = import.meta.env.VITE_API_KEY || 'pow3rb1_visor_3str4t3g1co_2025';
        if (apiKey) {
          config.headers['x-api-key'] = apiKey;
        }
        return config;
      },
      error => {
        console.error('Error en request interceptor:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      error => {
        console.error('Error en response interceptor:', error);

        // Manejo específico de errores
        if (error.response?.status === 401) {
          console.error('API Key inválida o expirada');
        } else if (error.response?.status === 403) {
          console.error('Acceso denegado');
        } else if (error.response?.status >= 500) {
          console.error('Error del servidor');
        } else if (error.code === 'ECONNABORTED') {
          console.error('Timeout de la petición');
        } else if (!error.response) {
          console.error('Error de red - verificar conexión');
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // El servidor respondió con un código de error
      const message = error.response.data?.message || 'Error del servidor';
      const status = error.response.status;
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return new Error('Error de red - No se pudo conectar al servidor');
    } else {
      // Algo más pasó
      return new Error(error.message || 'Error desconocido');
    }
  }

  // Método para obtener el cliente axios directamente si es necesario
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Instancia singleton
export const apiClient = new ApiClient();

// Exportar también la clase para testing
export { ApiClient };
