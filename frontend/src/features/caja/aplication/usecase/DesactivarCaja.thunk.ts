import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const DesactivarCajaThunk = createAsyncThunk<
    ApiResponse<void>,
    number,
    { rejectValue: string }
>(
    "caja/desactivarCaja",
    async (cajaId, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>(`/cajas/${cajaId}`);
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al desactivar la caja");
        }
    }
);