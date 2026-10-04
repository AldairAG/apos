import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type ProductoDto } from "../../domain/types/producto.types";

export const actualizarProductoThunk = createAsyncThunk<
    ApiResponse<ProductoDto>,
    ProductoDto,
    { rejectValue: string }
>(
    "producto/actualizar",
    async (producto, { rejectWithValue }) => {
        try {
            const response = await api.put<ProductoDto>(`${API_BASE_PATH}/${producto.id}`, producto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Error al actualizar el producto"
            );
        }
    }
);
