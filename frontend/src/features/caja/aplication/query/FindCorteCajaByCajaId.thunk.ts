import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CorteCajaDto } from "../../domain/Caja.types";
import { api } from "@/api/apiBase";

export const findCorteCajaByCajaIdThunk = createAsyncThunk<
    ApiResponse<CorteCajaDto>,
    number,
    { rejectValue: string }
>(
    'caja/findCorteCajaByCajaId',
    async (CajaId, { rejectWithValue }) => {
        try {
            const response = await api.get<CorteCajaDto>(`cajas/${CajaId}/corte`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener las corte de caja';
            return rejectWithValue(errorMessage);
        }
    }
);
