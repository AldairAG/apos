import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH } from "../../domain/types/receta.types";

export const deleteRecetaThunk = createAsyncThunk<
    ApiResponse<void>,
    number,
    { rejectValue: string }
>(
    'receta/deleteReceta',
    async (recetaId, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>(`${API_BASE_PATH}/${recetaId}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la receta';
            return rejectWithValue(errorMessage);
        }
    }
);
