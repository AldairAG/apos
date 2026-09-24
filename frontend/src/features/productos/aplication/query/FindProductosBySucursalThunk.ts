import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type ProductoDto } from "../../domain/types/producto.types";

export const findProductosBySucursalThunk = createAsyncThunk<
    ApiResponse<ProductoDto[]>,
    number,
    { rejectValue: string }
>(
    "producto/findBySucursal",
    async (sucursalId, { rejectWithValue }) => {
        try {
            const response = await api.get<ProductoDto[]>(`${API_BASE_PATH}/sucursal/${sucursalId}`);
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