import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MovimientoDto } from "../../domain/types/Movimiento.types";
import { api } from "@/api/apiBase";

export const findByDateQueryThunk = createAsyncThunk<
    ApiResponse<MovimientoDto[]>,
    { fecha: string },
    { rejectValue: string }
>(
    'movimiento/findByDate',
    async (movimientoDto, { rejectWithValue }) => {
        try {
            const response = await api.get<MovimientoDto[]>(`/movimientos/findByDate/${movimientoDto.fecha}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener los movimientos por fecha';
            return rejectWithValue(errorMessage);
        }
    }
);
