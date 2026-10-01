import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const desactivarUsuarioActualThunk = createAsyncThunk<
    ApiResponse<void>,
    void,
    { rejectValue: string }
>(
    "usuario/desactivarActual",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>("/usuarios/actual");
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al desactivar el usuario");
        }
    }
);