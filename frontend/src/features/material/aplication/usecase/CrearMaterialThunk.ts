import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, MaterialDto } from "../../domain/types/material.types";

export const crearMaterialThunk = createAsyncThunk<
    ApiResponse<MaterialDto>,
    MaterialDto,
    { rejectValue: string }
>(
    'material/crearMaterial',
    async (materialDto, { rejectWithValue }) => {
        try {
            const response = await api.post<MaterialDto>(`${API_BASE_PATH}/`, materialDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear el material';
            return rejectWithValue(errorMessage);
        }
    }
);
