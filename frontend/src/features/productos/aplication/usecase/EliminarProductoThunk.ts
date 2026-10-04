import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH } from "../../domain/types/producto.types";

export const eliminarProductoThunk = createAsyncThunk<
    ApiResponse<void>,
    number,
    { rejectValue: string }
>(
    "producto/eliminar",
    async (productoId, { rejectWithValue }) => {
        try {
            const response = await api.delete<void>(`${API_BASE_PATH}/${productoId}`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Error al eliminar el producto"
            );
        }
    }
);
