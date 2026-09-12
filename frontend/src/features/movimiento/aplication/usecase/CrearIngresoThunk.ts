import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MovimientoDto } from "../../domain/types/Movimiento.types";

export const crearIngresoThunk = createAsyncThunk<
    ApiResponse<MovimientoDto>,
    MovimientoDto,
    { rejectValue: string }
>(
    'movimiento/crearIngreso',
    async (movimientoDto, { rejectWithValue }) => {
        try {
            const response = await api.post<MovimientoDto>(`/movimientos/ingreso`, movimientoDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear ingreso';
            return rejectWithValue(errorMessage);
        }
    }
);
