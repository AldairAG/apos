import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type InventarioPage, type InventarioPageParams, type MovimientoInventarioDto } from "../../domain/types/inventario.types";

export const obtenerMovimientosThunk = createAsyncThunk<
    ApiResponse<InventarioPage<MovimientoInventarioDto>>,
    InventarioPageParams,
    { rejectValue: string }
>("inventario/obtenerMovimientos", async ({ sucursalId, page = 0, size = 100 }, { rejectWithValue }) => {
    try {
        const response = await api.get<InventarioPage<MovimientoInventarioDto>>(
            `${API_BASE_PATH}/sucursales/${sucursalId}/movimientos`,
            { params: { page, size } }
        );
        return response.success ? response : rejectWithValue(response.message);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Error al consultar movimientos");
    }
});