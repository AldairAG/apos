import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, CategoriaDto } from "../../domain/types/categoria.types";

export const crearCategoriaThunk = createAsyncThunk<
    ApiResponse<CategoriaDto>,
    CategoriaDto,
    { rejectValue: string }
>(
    "categoria/crear",
    async (categoriaDto, { rejectWithValue }) => {
        try {
            const response = await api.post<CategoriaDto>(
                `${API_BASE_PATH}/`,
                categoriaDto
            );
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Error al crear la categoría";
            return rejectWithValue(errorMessage);
        }
    }
);
