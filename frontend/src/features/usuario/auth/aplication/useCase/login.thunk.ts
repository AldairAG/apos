import { ApiResponse } from "@/api/apiTypes";
import { AuthRequest, BASE_PATH, JwtResponse } from "../../domain/types/auth.types";
import { api, apiBase } from "@/api/apiBase";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const loginThunk = createAsyncThunk<
    ApiResponse<JwtResponse>,
    AuthRequest,
    { rejectValue: string }
>(
    'auth/login',
    async (loginRequest, { rejectWithValue }) => {
        try {
            const response = await api.post<JwtResponse>(`${BASE_PATH}/auth/login`, loginRequest);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
             await apiBase.setAuthToken(response.data.token);
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error en el login';
            return rejectWithValue(errorMessage);
        }
    }
);
