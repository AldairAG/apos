import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, RecetaDto } from "../../domain/types/receta.types";

export const updateRecetaThunk = createAsyncThunk<
    ApiResponse<RecetaDto>,
    { id: number; receta: RecetaDto },
    { rejectValue: string }
>(
    'receta/updateReceta',
    async ({ id, receta }, { rejectWithValue }) => {
        try {
            const response = await api.put<RecetaDto>(`${API_BASE_PATH}/${id}`, receta);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la receta';
            return rejectWithValue(errorMessage);
        }
    }
);
