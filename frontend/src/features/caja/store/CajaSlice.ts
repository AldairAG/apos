import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CajaDto } from "../domain/Caja.types";
import {findCajasBySucursalIdThunk} from "../aplication/query/FindCajasBySucursalId.thunk";
import {crearCajaThunk} from "../aplication/usecase/CrearCaja.thunk";
import { ApiResponse } from "@/api/apiTypes";

interface CajaState {
    cajas: CajaDto[];
    cajaSeleccionadaId: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: CajaState = {
    cajas: [],
    cajaSeleccionadaId: null,
    loading: false,
    error: null,
};

const cajaSlice = createSlice({
    name: "caja",
    initialState,
    reducers: {
        seleccionarCaja(state, action: PayloadAction<number>) {
            state.cajaSeleccionadaId = action.payload;
        },
        limpiarCajaSeleccionada(state) {
            state.cajaSeleccionadaId = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(findCajasBySucursalIdThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findCajasBySucursalIdThunk.fulfilled, (state, action: PayloadAction<ApiResponse<CajaDto[]>>) => {
            state.loading = false;
            state.cajas = action.payload.data;
        });
        builder.addCase(findCajasBySucursalIdThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });

        builder.addCase(crearCajaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearCajaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<CajaDto>>) => {
            state.loading = false;
            state.cajas.push(action.payload.data);
        });
        builder.addCase(crearCajaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });
    },
});


export const { seleccionarCaja, limpiarCajaSeleccionada } = cajaSlice.actions;
export default cajaSlice.reducer;
