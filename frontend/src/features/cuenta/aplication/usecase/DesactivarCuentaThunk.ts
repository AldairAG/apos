import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const desactivarCuentaThunk = createAsyncThunk<
    ApiResponse<void>,
    number,
    { rejectValue: string }
>(
    "cuenta/desactivar",
    async (cuentaId, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>(`/cuentas/${cuentaId}`);
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al desactivar la cuenta");
        }
    }
);