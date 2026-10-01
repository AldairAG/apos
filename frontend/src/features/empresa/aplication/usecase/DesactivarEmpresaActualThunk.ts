import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const desactivarEmpresaActualThunk = createAsyncThunk<
    ApiResponse<void>,
    void,
    { rejectValue: string }
>(
    "empresa/desactivarActual",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>("/empresas/actual");
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al desactivar la empresa");
        }
    }
);