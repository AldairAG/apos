import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH } from "../../domain/types/sucursal.types";

export const desactivarSucursalThunk = createAsyncThunk<
    ApiResponse<void>,
    number,
    { rejectValue: string }
>(
    "sucursal/desactivar",
    async (sucursalId, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>(`${API_BASE_PATH}/${sucursalId}`);
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al desactivar la sucursal");
        }
    }
);