import { api } from "@/api/apiBase";
import { ApiResponse, Page } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, MaterialDto } from "../../domain/types/material.types";

export interface FindMaterialesParams {
    nombre?: string;
    page?: number;
    size?: number;
}

export const findMaterialesThunk = createAsyncThunk<
    ApiResponse<Page<MaterialDto>>,
    FindMaterialesParams | void,
    { rejectValue: string }
>(
    'material/findMateriales',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get<Page<MaterialDto>>(`${API_BASE_PATH}/`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener los materiales';
            return rejectWithValue(errorMessage);
        }
    }
);
