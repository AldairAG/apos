import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, RecetaDto } from "../../domain/types/receta.types";

export const obtenerRecetaPorIdThunk = createAsyncThunk<
    ApiResponse<RecetaDto>,
    number,
    { rejectValue: string }
>(
    'receta/obtenerRecetaPorId',
    async (recetaId, { rejectWithValue }) => {
        try {
            const response = await api.get<RecetaDto>(`${API_BASE_PATH}/${recetaId}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener la receta';
            return rejectWithValue(errorMessage);
        }
    }
);
