import { api } from "@/api/apiBase";
import type { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    POS_API_BASE_PATH,
    type OrdenDto,
    type PagarVentaDto,
} from "../../domain/types/pos.types";

export const cobrarOrdenThunk = createAsyncThunk<
    ApiResponse<OrdenDto>,
    PagarVentaDto,
    { rejectValue: string }
>("pos/cobrarOrden", async (pago, { rejectWithValue }) => {
    try {
        const response = await api.post<OrdenDto>(
            `${POS_API_BASE_PATH}/ordenes/cobrar`,
            pago
        );
        if (!response.success) return rejectWithValue(response.message);
        return response;
    } catch (error: unknown) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Error al cobrar la orden"
        );
    }
});