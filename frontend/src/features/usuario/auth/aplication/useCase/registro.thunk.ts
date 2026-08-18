import { api } from "@/api/apiBase";
import { BASE_PATH, JwtResponse, RegistroRequestDTO } from "../../domain/types/auth.types";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registroThunk = createAsyncThunk<
    ApiResponse<JwtResponse>,
    RegistroRequestDTO,
    { rejectValue: string }
>(
    'auth/registro',
    async (registroRequest, { rejectWithValue }) => {
        try {
            const response = await api.post<JwtResponse>(`${BASE_PATH}/registro`, registroRequest);;
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

