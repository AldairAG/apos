import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findMesasBySucursalIdThunk } from "../aplication/query/FindMesasBySucursalIdThunk";
import { crearMesaThunk } from "../aplication/usecase/CrearMesaThunk";
import type { MesaDto } from "../domain/types/mesa.types";

interface MesaState {
    mesas: MesaDto[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: MesaState = {
    mesas: [],
    loading: false,
    saving: false,
    error: null,
};

const mesaSlice = createSlice({
    name: "mesa",
    initialState,
    reducers: {
        limpiarErrorMesa(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(findMesasBySucursalIdThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findMesasBySucursalIdThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.mesas = action.payload.data;
        });
        builder.addCase(
            findMesasBySucursalIdThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al obtener las mesas";
            }
        );
        builder.addCase(crearMesaThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(crearMesaThunk.fulfilled, (state, action) => {
            state.saving = false;
            state.mesas.push(action.payload.data);
        });
        builder.addCase(crearMesaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.saving = false;
            state.error = action.payload ?? "Error al crear la mesa";
        });
    },
});

export const { limpiarErrorMesa } = mesaSlice.actions;
export default mesaSlice.reducer;
