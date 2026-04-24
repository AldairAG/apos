import { showToast } from '@/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponseWrapper<T> {
	success: boolean;
	data: T;
	error: string | null;
}

export interface JwtResponse {
	token: string;
	type: string;
	id: number;
	email: string;
}

// Configuración base
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:8080/api' // Desarrollo
    : 'http://localhost:8080/api', // Producción
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Interceptor de Request - Agregar token JWT
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token del almacenamiento
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log en desarrollo
      if (__DEV__) {
        console.log('📤 Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      console.error('Error en request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log en desarrollo
    if (__DEV__) {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Log de error
    if (__DEV__) {
      console.error('❌ Error Response:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }

    // Manejo de diferentes tipos de errores
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token inválido o expirado
          await handleUnauthorized();
          showToast.error('Por favor, inicia sesión nuevamente', 'Sesión expirada');
          break;

        case 403:
          showToast.error('No tienes permisos para realizar esta acción', 'Acceso denegado');
          break;

        case 404:
          showToast.error(data?.message || 'El recurso solicitado no existe', 'No encontrado');
          break;

        case 422:
          // Errores de validación
          showToast.error(data?.message || 'Verifica los datos ingresados', 'Error de validación');
          break;

        case 500:
          showToast.error('Ocurrió un error inesperado. Intenta más tarde', 'Error del servidor');
          break;

        default:
          showToast.error(data?.message || 'Ocurrió un error inesperado', 'Error');
      }
    } else if (error.request) {
      // Error de red
      showToast.error('Verifica tu conexión a internet', 'Error de conexión');
    } else {
      showToast.error(error.message || 'Ocurrió un error inesperado', 'Error');
    }

    return Promise.reject(error);
  }
);

// Función para manejar sesión no autorizada
const handleUnauthorized = async () => {
  try {
    // Limpiar el token
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    
    // Aquí podrías redirigir al login si tienes acceso al navegador
    // Por ejemplo usando router.replace('/auth/login') si estás usando expo-router
  } catch (error) {
    console.error('Error al limpiar sesión:', error);
  }
};

// Métodos HTTP tipados
export const api = {
  // GET
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },

  // POST
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },

  // PUT
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },

  // PATCH
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },

  // DELETE
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
};

// Utilidades
export const apiUtils = {
  // Actualizar token manualmente
  setAuthToken: async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
  },

  // Obtener token actual
  getAuthToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  },

  // Limpiar token
  clearAuthToken: async () => {
    await AsyncStorage.removeItem('authToken');
  },

  // Actualizar base URL (útil para cambiar entre entornos)
  setBaseURL: (url: string) => {
    apiClient.defaults.baseURL = url;
  },

  // Obtener base URL actual
  getBaseURL: (): string | undefined => {
    return apiClient.defaults.baseURL;
  },
};

export default api;
