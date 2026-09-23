import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, CategoriaDto } from "../../domain/types/categoria.types";

export const findCategoriasBySucursalThunk = createAsyncThunk<
    ApiResponse<CategoriaDto[]>,
    number,
    { rejectValue: string }
>(
    "categoria/findBySucursal",
    async (sucursalId, { rejectWithValue }) => {
        try {
            const response = await api.get<CategoriaDto[]>(
                `${API_BASE_PATH}/sucursal/${sucursalId}`
            );
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Error al obtener las categorías";
            return rejectWithValue(errorMessage);
        }
    }
);
