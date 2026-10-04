import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    POS_API_BASE_PATH,
    type CategoriaProductoDto,
} from "../../domain/types/pos.types";

export const findProductosPosByEmpresaIdThunk = createAsyncThunk<
    ApiResponse<CategoriaProductoDto[]>,
    number,
    { rejectValue: string }
>("pos/findProductosByEmpresa", async (empresaId, { rejectWithValue }) => {
    try {
        const response = await api.get<CategoriaProductoDto[]>(
            `${POS_API_BASE_PATH}/productos/empresa/${empresaId}`
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al obtener los productos"
        );
    }
});