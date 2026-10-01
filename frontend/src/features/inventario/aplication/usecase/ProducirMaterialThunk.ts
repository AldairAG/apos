import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type MovimientoInventarioDto, type ProducirMaterialDto } from "../../domain/types/inventario.types";

export const producirMaterialThunk = createAsyncThunk<
    ApiResponse<MovimientoInventarioDto[]>,
    ProducirMaterialDto,
    { rejectValue: string }
>("inventario/producirMaterial", async (request, { rejectWithValue }) => {
    try {
        const response = await api.post<MovimientoInventarioDto[]>(`${API_BASE_PATH}/produccion`, request);
        return response.success ? response : rejectWithValue(response.message);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Error al producir material");
    }
});