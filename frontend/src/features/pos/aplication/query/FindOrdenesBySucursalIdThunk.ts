import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { POS_API_BASE_PATH, type OrdenDto } from "../../domain/types/pos.types";

export const findOrdenesBySucursalIdThunk = createAsyncThunk<
    ApiResponse<OrdenDto[]>,
    number,
    { rejectValue: string }
>("pos/findOrdenesBySucursal", async (sucursalId, { rejectWithValue }) => {
    try {
        const response = await api.get<OrdenDto[]>(
            `${POS_API_BASE_PATH}/ordenes/sucursal/${sucursalId}`
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al obtener las órdenes"
        );
    }
});