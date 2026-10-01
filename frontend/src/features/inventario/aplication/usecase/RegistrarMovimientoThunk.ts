import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    API_BASE_PATH,
    type MovimientoInventarioDto,
    type RegistrarMovimientoInventarioDto,
    type TipoOperacionInventario,
} from "../../domain/types/inventario.types";

const RUTAS: Record<TipoOperacionInventario, string> = {
    entrada: "entradas",
    salida: "salidas",
    merma: "mermas",
    "consumo-personal": "consumo-personal",
};

export const registrarMovimientoThunk = createAsyncThunk<
    ApiResponse<MovimientoInventarioDto>,
    { tipo: TipoOperacionInventario; request: RegistrarMovimientoInventarioDto },
    { rejectValue: string }
>("inventario/registrarMovimiento", async ({ tipo, request }, { rejectWithValue }) => {
    try {
        const response = await api.post<MovimientoInventarioDto>(`${API_BASE_PATH}/${RUTAS[tipo]}`, request);
        return response.success ? response : rejectWithValue(response.message);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Error al registrar el movimiento");
    }
});