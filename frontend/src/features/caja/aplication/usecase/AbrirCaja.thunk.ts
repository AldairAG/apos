import { ApiResponse } from "@/api/apiTypes";
import { CajaDto } from "../../domain/Caja.types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/apiBase";

export const AbrirCajaThunk = createAsyncThunk<
    ApiResponse<CajaDto>,
    number,
    { rejectValue: string }
>(
    'caja/abrirCaja',
    async (cajaId, { rejectWithValue }) => {
        try {
            const response = await api.post<CajaDto>(`/cajas/${cajaId}/abrir`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al abrir la caja';
            return rejectWithValue(errorMessage);
        }
    }
);
