import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { MovimientoDto, RegistrarCompraDto } from "../../domain/types/Movimiento.types";

export const crearCompraThunk = createAsyncThunk<
    ApiResponse<MovimientoDto>,
    RegistrarCompraDto,
    { rejectValue: string }
>(
    "movimiento/crearCompra",
    async (movimientoDto, { rejectWithValue }) => {
        try {
            const response = await api.post<MovimientoDto>("/movimientos/compra", movimientoDto);
            return response.success ? response : rejectWithValue(response.message);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Error al registrar la compra");
        }
    }
);