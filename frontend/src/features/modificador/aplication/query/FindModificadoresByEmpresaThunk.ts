import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, ModificadorDto } from "../../domain/types/modificador.types";

export const findModificadoresByEmpresaThunk = createAsyncThunk<
    ApiResponse<ModificadorDto[]>,
    void,
    { rejectValue: string }
>(
    "modificador/findByEmpresa",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<ModificadorDto[]>(`${API_BASE_PATH}/empresa`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Error al obtener los modificadores";
            return rejectWithValue(errorMessage);
        }
    }
);