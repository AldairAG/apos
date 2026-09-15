import { api } from "@/api/apiBase";
import { CajaDto } from "../../domain/Caja.types";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const crearCajaThunk = createAsyncThunk<
    ApiResponse<CajaDto>,
    { sucursalId: number; cajaDto: CajaDto },
    { rejectValue: string }
>(
    'caja/crearCaja',
    async ({ sucursalId, cajaDto }, { rejectWithValue }) => {
        try {
            const response = await api.post<CajaDto>(`/cajas/sucursal/${sucursalId}`, cajaDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la caja';
            return rejectWithValue(errorMessage);
        }
    }
);
