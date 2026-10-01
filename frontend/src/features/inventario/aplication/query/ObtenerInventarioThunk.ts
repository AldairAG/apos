import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type ExistenciaDto, type InventarioPage, type InventarioPageParams } from "../../domain/types/inventario.types";

export const obtenerInventarioThunk = createAsyncThunk<
    ApiResponse<InventarioPage<ExistenciaDto>>,
    InventarioPageParams,
    { rejectValue: string }
>("inventario/obtenerExistencias", async ({ sucursalId, page = 0, size = 100 }, { rejectWithValue }) => {
    try {
        const response = await api.get<InventarioPage<ExistenciaDto>>(
            `${API_BASE_PATH}/sucursales/${sucursalId}/existencias`,
            { params: { page, size } }
        );
        return response.success ? response : rejectWithValue(response.message);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Error al consultar inventario");
    }
});