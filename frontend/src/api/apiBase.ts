/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse, RequestData, UploadProgressEvent } from './apiTypes';

// Storage wrapper optimizado para Web usando sessionStorage
class WebSessionStorageWrapper {
    constructor() {
        // Verificar si sessionStorage está disponible
        if (typeof window === 'undefined' || !window.sessionStorage) {
            console.warn('sessionStorage no está disponible, usando memoria temporal');
        }
    }

    async getItem(key: string): Promise<string | null> {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return sessionStorage.getItem(key);
            }
            return null;
        } catch (error) {
            console.error('Error al obtener item del sessionStorage:', error);
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.setItem(key, value);
            }
        } catch (error) {
            console.error('Error al guardar item en sessionStorage:', error);
            throw error;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Error al eliminar item del sessionStorage:', error);
            throw error;
        }
    }

    // Método adicional para limpiar todo el storage
    async clear(): Promise<void> {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.clear();
            }
        } catch (error) {
            console.error('Error al limpiar sessionStorage:', error);
            throw error;
        }
    }

    // Método para obtener todas las claves
    getAllKeys(): string[] {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return Object.keys(sessionStorage);
            }
            return [];
        } catch (error) {
            console.error('Error al obtener claves del sessionStorage:', error);
            return [];
        }
    }
}

const storage = new WebSessionStorageWrapper();

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8080/api';
//const API_BASE_URL = 'http://192.168.1.4:8080/api';
//const API_BASE_URL = 'http://192.168.1.85:8080/api';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
    '/usuarios/registro',
    '/usuarios/login',
];

// Función auxiliar para verificar si una ruta es pública
const isPublicRoute = (url: string): boolean => {
    return PUBLIC_ROUTES.some(route => url.includes(route));
};

class ApiBase {
    private axiosInstance: AxiosInstance;
    // Referencia opcional al store; se establece desde fuera para evitar ciclos de importación
    private store: any | null = null;

    constructor() {
        // Crear instancia de Axios
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000, // 30 segundos
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Configurar interceptores
        this.setupInterceptors();
    }

    // Permitir que el store sea inyectado desde el exterior (por ejemplo desde `store/index.ts`)
    public setStore(store: any) {
        this.store = store;
    }

    private setupInterceptors() {
        // Interceptor de request mejorado
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    // Verificar si la ruta es pública (no requiere autenticación)
                    const routeIsPublic = isPublicRoute(config.url || '');

                    if (!routeIsPublic) {
                        // 1. Prioridad: obtener token desde Redux
                        let token = this.getTokenFromRedux();

                        // 2. Fallback: obtener desde storage o AsyncStorage cuando Redux aún no está listo
                        if (!token) {
                            token = await this.getTokenFromStorage();
                        }

                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;

                            if (__DEV__) {
                                console.log(`🔐 Request with auth: ${config.method?.toUpperCase()} ${config.url}`);
                            }
                        } else if (__DEV__) {
                            console.log(`🔓 Request without auth: ${config.method?.toUpperCase()} ${config.url}`);
                        }
                    } else if (__DEV__) {
                        console.log(`🌐 Request to public route (no auth): ${config.method?.toUpperCase()} ${config.url}`);
                    }
                } catch (error) {
                    console.error('Error al obtener el token:', error);
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor de response para manejo de errores
        this.axiosInstance.interceptors.response.use(
            (response) => {
                if (__DEV__) {
                    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                        status: response.status,
                    });
                }
                return response;
            },
            async (error) => {
                if (__DEV__) {
                    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                        status: error.response?.status,
                        message: error.response?.data?.message,
                    });
                }

                // Manejo específico de errores de autenticación
                if (error.response?.status === 401) {
                    console.log('🚪 Token expirado o inválido - cerrando sesión');
                    await this.handleUnauthorized();
                }

                return Promise.reject(error);
            }
        );
    }

    // Obtener token desde Redux store
    private getTokenFromRedux(): string | null {
        try {
            if (!this.store) return null;
            const state = this.store.getState();
            return state?.auth?.token || null;
        } catch (error) {
            console.warn('No se pudo obtener token desde Redux:', error);
            return null;
        }
    }

    private async getTokenFromStorage(): Promise<string | null> {
        try {
            const tokenFromStorage = await storage.getItem('auth_token');
            if (tokenFromStorage) {
                return tokenFromStorage;
            }

            const tokenFromAsyncStorage = await AsyncStorage.getItem('auth_token');
            if (tokenFromAsyncStorage) {
                await storage.setItem('auth_token', tokenFromAsyncStorage);
                return tokenFromAsyncStorage;
            }

            return null;
        } catch (error) {
            console.warn('No se pudo obtener token desde el almacenamiento:', error);
            return null;
        }
    }

    // Manejo mejorado de 401
    private async handleUnauthorized() {
        try {
            // 1. Limpiar storage
            await storage.removeItem('auth_token');
            await storage.removeItem('auth_user');

            // 2. Limpiar headers de axios
            delete this.axiosInstance.defaults.headers.common['Authorization'];

            // 3. Dispatch logout en Redux (si el store fue inyectado)
            if (this.store) {
                try {
                    const module = await import('../features/usuario/auth/auth.slice');
                    const logout = module.logout;
                    this.store.dispatch(logout());
                } catch (error) {
                    console.log(error);

                    // Fallback: si no se puede importar la acción, intentar dispatch por tipo
                    try {
                        this.store.dispatch({ type: 'auth/logout' });
                    } catch (err) {
                        console.error('No se pudo dispatch logout:', err);
                    }
                }
            }

            console.log('✅ Sesión limpiada completamente');
        } catch (error) {
            console.error('Error al limpiar la sesión:', error);
        }
    }

    // Método para sincronizar token desde Redux
    public syncTokenFromRedux(): void {

        const token = this.getTokenFromRedux();
        if (token) {
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.axiosInstance.defaults.headers.common['Authorization'];
        }
    }

    // Método para inicializar token desde storage al arranque
    public async initializeAuthFromStorage(): Promise<void> {
        try {
            const token = JSON.parse(localStorage.getItem("auth_token")!)
            if (token) {
                this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('🔐 Token inicializado desde sessionStorage');
            }
        } catch (error) {
            console.error('Error al inicializar token:', error);
        }
    }

    // Método para upload de archivos
    async uploadFile<T>(
        url: string,
        file: FormData,
        onUploadProgress?: (progressEvent: UploadProgressEvent) => void
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.post<ApiResponse<T>>(url, file, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: onUploadProgress ? (progressEvent) => {
                    const customEvent: UploadProgressEvent = {
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        progress: progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0,
                        lengthComputable: progressEvent.lengthComputable
                    };
                    onUploadProgress(customEvent);
                } : undefined,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    descargarArchivo = async (fileName: string): Promise<Blob> => {
        try {
            // Obtener token de Redux o storage
            let token = this.getTokenFromRedux();
            if (!token) {
                token = JSON.parse(await storage.getItem('auth_token') || 'null');
            }

            const response = await fetch(
                `${API_BASE_URL}/${fileName}`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error al obtener archivo: ${response.statusText}`);
            }

            // Obtener el Content-Type del response
            const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

            // Crear blob con el tipo MIME correcto
            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: contentType });

            return blob;
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            throw error;
        }
    };

    // Métodos de utilidad

    // Actualizar token manualmente
    async setAuthToken(token: string): Promise<void> {
        try {
            const normalizedToken = token.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token;
            await storage.setItem('auth_token', normalizedToken);
            await AsyncStorage.setItem('auth_token', normalizedToken);
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${normalizedToken}`;
        } catch (error) {
            console.error('Error al establecer el token:', error);
        }
    }

    // Limpiar token
    async clearAuthToken(): Promise<void> {
        try {
            await storage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_token');
            delete this.axiosInstance.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Error al limpiar el token:', error);
        }
    }

    // Obtener la instancia de Axios para casos especiales
    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    // Manejo de errores centralizado
    private handleError(error: unknown): Error {
        let errorMessage = 'Error desconocido';

        if (axios.isAxiosError(error)) {
            if (error.response?.data) {
                // Error desde el servidor
                const serverError = error.response.data;
                if (serverError.message) {
                    errorMessage = serverError.message;
                } else if (typeof serverError === 'string') {
                    errorMessage = serverError;
                }
            } else if (error.message) {
                // Error de Axios o red
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Error(errorMessage);
    }


    // Métodos públicos para realizar requests

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async put<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async patch<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

// Exportar una instancia única (singleton)
export const apiBase = new ApiBase();

// Exportar la clase para casos donde se necesite crear múltiples instancias
// Exportar la clase para casos donde se necesite crear múltiples instancias
export { API_BASE_URL, ApiBase };

// Helper functions para facilitar el uso
export const api = {
    uploadFile: <T>(url: string, file: FormData, onUploadProgress?: (progressEvent: UploadProgressEvent) => void) =>
        apiBase.uploadFile<T>(url, file, onUploadProgress),
    descargarArchivo: (fileName: string) => apiBase.descargarArchivo(fileName),
    get: <T>(url: string, config?: AxiosRequestConfig) => apiBase.get<T>(url, config),
    post: <T>(url: string, data?: RequestData, config?: AxiosRequestConfig) => apiBase.post<T>(url, data, config),
    put: <T>(url: string, data?: RequestData, config?: AxiosRequestConfig) => apiBase.put<T>(url, data, config),
    patch: <T>(url: string, data?: RequestData, config?: AxiosRequestConfig) => apiBase.patch<T>(url, data, config),
    delete: <T>(url: string, config?: AxiosRequestConfig) => apiBase.delete<T>(url, config),
};
