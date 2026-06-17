import { ApiResponse } from "@/api/apiTypes";
import { JwtResponse, LoginRequestDTO, RegistroRequestDTO } from "./auth.types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./auth.service";

export const registro = createAsyncThunk<
    ApiResponse<JwtResponse>,
    RegistroRequestDTO,
    { rejectValue: string }
>(
    'auth/registro',
    async (registroRequest, { rejectWithValue }) => {
        try {
            const response = await authService.registrar(registroRequest);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
            return rejectWithValue(errorMessage);
        }
    }
);

export const login = createAsyncThunk<
    ApiResponse<JwtResponse>,
    LoginRequestDTO,
    { rejectValue: string }
>(
    'auth/login',
    async (loginRequest, { rejectWithValue }) => {
        try {
            const response = await authService.login(loginRequest);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error en el login';
            return rejectWithValue(errorMessage);
        }
    }
);
