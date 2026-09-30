import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    POS_API_BASE_PATH,
    type OrdenDto,
} from "../../domain/types/pos.types";

export const actualizarEstadoOrdenThunk = createAsyncThunk<
    ApiResponse<OrdenDto>,
    number,
    { rejectValue: string }
>("pos/actualizarEstadoOrden", async (ordenId, { rejectWithValue }) => {
    try {
        const response = await api.post<OrdenDto>(
            `${POS_API_BASE_PATH}/ordenes/actualizar-estado?ordenId=${ordenId}`,
            null
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al actualizar la orden"
        );
    }
});