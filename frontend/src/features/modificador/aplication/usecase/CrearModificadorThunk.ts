import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, ModificadorDto } from "../../domain/types/modificador.types";

export const crearModificadorThunk = createAsyncThunk<
    ApiResponse<ModificadorDto>,
    ModificadorDto,
    { rejectValue: string }
>(
    "modificador/crearModificador",
    async (modificadorDto, { rejectWithValue }) => {
        try {
            const response = await api.post<ModificadorDto>(API_BASE_PATH, modificadorDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Error al crear el modificador";
            return rejectWithValue(errorMessage);
        }
    }
);