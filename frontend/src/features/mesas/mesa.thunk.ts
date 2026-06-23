import { createAsyncThunk } from "@reduxjs/toolkit";
import { mesaService } from "./mesa.service";
import { Mesa } from "./mesas.types";

export const fetchMesasBySucursalId = createAsyncThunk<
    Mesa[],
    number,
    { rejectValue: string }
>('mesa/fetchBySucursalId', async (sucursalId, { rejectWithValue }) => {
    try {
        const mesas = await mesaService.getBySucursalId(sucursalId);
        return mesas;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las mesas'
        );
    }
});
