import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CajaDto, CorteCajaDto } from "../domain/Caja.types";
import {findCajasBySucursalIdThunk} from "../aplication/query/FindCajasBySucursalId.thunk";
import {crearCajaThunk} from "../aplication/usecase/CrearCaja.thunk";
import { ApiResponse } from "@/api/apiTypes";
import { AbrirCajaThunk } from "../aplication/usecase/AbrirCaja.thunk";
import { CerrarCajaThunk } from "../aplication/usecase/CerrarCaja.thunk";

interface CajaState {
    cajas: CajaDto[];
    cajaSeleccionadaId: number | null;
    corteCaja:CorteCajaDto | null;
    loading: boolean;
    error: string | null;
}

const initialState: CajaState = {
    cajas: [],
    cajaSeleccionadaId: null,
    corteCaja: null,
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
            state.cajaSeleccionadaId = action.payload.data[0]?.id ?? 0;
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
            state.cajaSeleccionadaId = action.payload.data.id;
        });
        builder.addCase(crearCajaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });
        builder.addCase(AbrirCajaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(AbrirCajaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<CajaDto>>) => {
            state.loading = false;
            const index = state.cajas.findIndex(caja => caja.id === action.payload.data.id);
            if (index !== -1) {
                state.cajas[index] = action.payload.data;
            }
        });
        builder.addCase(AbrirCajaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });
        builder.addCase(CerrarCajaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(CerrarCajaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<CajaDto>>) => {
            state.loading = false;
            const index = state.cajas.findIndex(caja => caja.id === action.payload.data.id);
            if (index !== -1) {
                state.cajas[index] = action.payload.data;
            }
        });
        builder.addCase(CerrarCajaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });
    },
});


export const { seleccionarCaja, limpiarCajaSeleccionada } = cajaSlice.actions;
export default cajaSlice.reducer;
