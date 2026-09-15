import { api } from "@/api/apiBase";
import { CajaDto } from "../../domain/Caja.types";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const findCajasBySucursalIdThunk = createAsyncThunk<
    ApiResponse<CajaDto[]>,
    number,
    { rejectValue: string }
>(
    'caja/findCajasBySucursalId',
    async (sucursalId, { rejectWithValue }) => {
        try {
            const response = await api.get<CajaDto[]>(`cajas/sucursal/${sucursalId}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener las cajas';
            return rejectWithValue(errorMessage);
        }
    }
);
