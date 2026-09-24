import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, RecetaDto } from "../../domain/types/receta.types";

export const crearRecetaThunk = createAsyncThunk<
    ApiResponse<RecetaDto>,
    RecetaDto,
    { rejectValue: string }
>(
    'receta/crearReceta',
    async (recetaDto, { rejectWithValue }) => {
        try {
            const response = await api.post<RecetaDto>(`${API_BASE_PATH}`, recetaDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la receta';
            return rejectWithValue(errorMessage);
        }
    }
);
