import { api, ApiResponseWrapper, apiUtils, JwtResponse } from '@/api/apiBase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

import { AuthRequest } from './auth.types';

const AUTH_BASE_PATH = '/usuarios';

const extractErrorMessage = (error: unknown): string => {
	if (error instanceof AxiosError) {
		const backendError = (error.response?.data as { error?: string } | undefined)?.error;
		return backendError || error.message || 'Error de autenticacion';
	}

	return 'Error de autenticacion';
};

const persistSession = async (payload: JwtResponse): Promise<void> => {
	await apiUtils.setAuthToken(payload.token);
	await AsyncStorage.setItem('user', JSON.stringify({ id: payload.id, email: payload.email }));
};

export const authService = {
	login: async (request: AuthRequest): Promise<JwtResponse> => {
		try {
			const response = await api.post<ApiResponseWrapper<JwtResponse>>(
				`${AUTH_BASE_PATH}/login`,
				request
			);

			if (!response.data.success || !response.data.data) {
				throw new Error(response.data.error || 'No fue posible iniciar sesion');
			}

			await persistSession(response.data.data);
			return response.data.data;
		} catch (error) {
			throw new Error(extractErrorMessage(error));
		}
	},

	register: async (request: AuthRequest): Promise<JwtResponse> => {
		try {
			const response = await api.post<ApiResponseWrapper<JwtResponse>>(
				`${AUTH_BASE_PATH}/registro`,
				request
			);

			if (!response.data.success || !response.data.data) {
				throw new Error(response.data.error || 'No fue posible completar el registro');
			}

			await persistSession(response.data.data);
			return response.data.data;
		} catch (error) {
			throw new Error(extractErrorMessage(error));
		}
	},
};

export default authService;

