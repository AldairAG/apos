import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    POS_API_BASE_PATH,
    type OrdenDto,
} from "../../domain/types/pos.types";

export const crearOrdenThunk = createAsyncThunk<
    ApiResponse<OrdenDto>,
    OrdenDto,
    { rejectValue: string }
>("pos/crearOrden", async (ordenDto, { rejectWithValue }) => {
    try {
        const response = await api.post<OrdenDto>(
            `${POS_API_BASE_PATH}/ordenes/crear`,
            ordenDto
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al crear la orden"
        );
    }
});