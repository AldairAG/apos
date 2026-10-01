import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MESA_API_BASE_PATH, type MesaDto } from "../../domain/types/mesa.types";

export const findMesasBySucursalIdThunk = createAsyncThunk<
    ApiResponse<MesaDto[]>,
    number,
    { rejectValue: string }
>("mesa/findMesasBySucursal", async (sucursalId, { rejectWithValue }) => {
    try {
        const response = await api.get<MesaDto[]>(
            `${MESA_API_BASE_PATH}/sucursal/${sucursalId}`
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al obtener las mesas"
        );
    }
});
