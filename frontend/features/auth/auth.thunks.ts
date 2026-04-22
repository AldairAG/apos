import { apiUtils } from "@/api/apiBase";
import { AppDispatch } from "@/store/store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from "./auth.service";
import { authActions } from './auth.slice';
import { AuthRequest } from "./auth.types";

export const authThunks = {
    login: (request: AuthRequest) => async (dispatch: AppDispatch) => {
        try {
            const response = await authService.login(request);
            dispatch(authActions.loginSuccess(response));
            return { success: true as const };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            dispatch(authActions.loginFailure(message));
            return { success: false as const, error: message };
        }
    },

    register: (request: AuthRequest) => async (dispatch: AppDispatch) => {
        try {
            const response = await authService.register(request);
            dispatch(authActions.registerSuccess(response));
            return { success: true as const };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            dispatch(authActions.registerFailure(message));
            return { success: false as const, error: message };
        }
    },

    logout: () => async (dispatch: AppDispatch) => {
        try {
            await apiUtils.clearAuthToken();
            await AsyncStorage.removeItem('user');
            dispatch(authActions.logout());
        }
        catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    },
};