import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, type CrearProductoPayload, type ProductoDto } from "../../domain/types/producto.types";

export const crearProductoThunk = createAsyncThunk<
    ApiResponse<ProductoDto>[],
    CrearProductoPayload,
    { rejectValue: string }
>(
    "producto/crear",
    async ({ producto, sucursalIds }, { rejectWithValue }) => {
        try {
            const responses: ApiResponse<ProductoDto>[] = [];
            for (const sucursalId of sucursalIds) {
                const response = await api.post<ProductoDto>(API_BASE_PATH, { ...producto, sucursalId });
                if (!response.success) {
                    return rejectWithValue(response.message);
                }
                responses.push(response);
            }
            return responses;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Error al crear el producto"
            );
        }
    }
);