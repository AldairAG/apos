import { api } from "@/api/apiBase";
import { ApiResponse, Page } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, RecetaDto } from "../../domain/types/receta.types";

export interface FindRecetasParams {
    nombre?: string;
    page?: number;
    size?: number;
}

export const findRecetasThunk = createAsyncThunk<
    ApiResponse<Page<RecetaDto>>,
    FindRecetasParams | void,
    { rejectValue: string }
>(
    'receta/findRecetas',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get<Page<RecetaDto>>(`${API_BASE_PATH}/`, {
                params: {
                    nombre: params?.nombre || undefined,
                    page: params?.page ?? 0,
                    size: params?.size ?? 10,
                },
            });
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener las recetas';
            return rejectWithValue(errorMessage);
        }
    }
);
