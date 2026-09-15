import { createAsyncThunk } from "@reduxjs/toolkit";
import { CajaDto } from "../../domain/Caja.types";
import { ApiResponse } from "@/api/apiTypes";
import { api } from "@/api/apiBase";

export const CerrarCajaThunk = createAsyncThunk<
    ApiResponse<CajaDto>,
    number,
    { rejectValue: string }
>(
    'caja/cerrarCaja',
    async (cajaId, { rejectWithValue }) => {
        try {
            const response = await api.post<CajaDto>(`/cajas/${cajaId}/cerrar`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cerrar la caja';
            return rejectWithValue(errorMessage);
        }
    }
);
