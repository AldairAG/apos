import { ApiResponse } from "@/api/apiTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findCajasBySucursalIdThunk } from "../aplication/query/FindCajasBySucursalId.thunk";
import { findCorteCajaByCajaIdThunk } from "../aplication/query/FindCorteCajaByCajaId.thunk";
import { AbrirCajaThunk } from "../aplication/usecase/AbrirCaja.thunk";
import { CerrarCajaThunk } from "../aplication/usecase/CerrarCaja.thunk";
import { crearCajaThunk } from "../aplication/usecase/CrearCaja.thunk";
import { DesactivarCajaThunk } from "../aplication/usecase/DesactivarCaja.thunk";
import { CajaDto, CorteCajaDto } from "../domain/Caja.types";

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
        builder.addCase(findCorteCajaByCajaIdThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findCorteCajaByCajaIdThunk.fulfilled, (state, action: PayloadAction<ApiResponse<CorteCajaDto>>) => {
            state.loading = false;
            state.corteCaja = action.payload.data;
        });
        builder.addCase(findCorteCajaByCajaIdThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error desconocido";
        });
        builder.addCase(DesactivarCajaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(DesactivarCajaThunk.fulfilled, (state, action) => {
            state.loading = false;
            const deletedId = action.meta.arg;
            state.cajas = state.cajas.filter((caja) => caja.id !== deletedId);
            if (state.cajaSeleccionadaId === deletedId) {
                state.cajaSeleccionadaId = state.cajas[0]?.id ?? null;
                state.corteCaja = null;
            }
        });
        builder.addCase(DesactivarCajaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al desactivar la caja";
        });
    },
});


export const { seleccionarCaja, limpiarCajaSeleccionada } = cajaSlice.actions;
export default cajaSlice.reducer;
