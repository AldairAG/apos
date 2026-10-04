import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type ProductoDto } from "../../domain/types/producto.types";

export const findProductosByEmpresaThunk = createAsyncThunk<
    ApiResponse<ProductoDto[]>,
    number,
    { rejectValue: string }
>(
    "producto/findByEmpresa",
    async (empresaId, { rejectWithValue }) => {
        try {
            const response = await api.get<ProductoDto[]>(`${API_BASE_PATH}/empresa/${empresaId}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Error al obtener los productos"
            );
        }
    }
);