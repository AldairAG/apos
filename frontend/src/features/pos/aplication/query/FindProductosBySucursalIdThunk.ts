import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    POS_API_BASE_PATH,
    type CategoriaProductoDto,
} from "../../domain/types/pos.types";

export const findProductosPosBySucursalIdThunk = createAsyncThunk<
    ApiResponse<CategoriaProductoDto[]>,
    number,
    { rejectValue: string }
>("pos/findProductosBySucursal", async (sucursalId, { rejectWithValue }) => {
    try {
        const response = await api.get<CategoriaProductoDto[]>(
            `${POS_API_BASE_PATH}/productos/sucursal/${sucursalId}`
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al obtener los productos"
        );
    }
});