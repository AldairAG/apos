import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MESA_API_BASE_PATH, type MesaDto } from "../../domain/types/mesa.types";

export const crearMesaThunk = createAsyncThunk<
    ApiResponse<MesaDto>,
    MesaDto,
    { rejectValue: string }
>("mesa/crearMesa", async (mesaDto, { rejectWithValue }) => {
    try {
        const response = await api.post<MesaDto>(MESA_API_BASE_PATH, mesaDto);
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al crear la mesa"
        );
    }
});
