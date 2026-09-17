import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { crearEgresoThunk } from "../aplication/usecase/CrearEgresoThunk";
import { crearIngresoThunk } from "../aplication/usecase/CrearIngresoThunk";
import { findByDateQueryThunk } from "../aplication/query/FindByDateQueryThunk";
import { MovimientoDto } from "../domain/types/Movimiento.types";
import { findCorteCajaByCajaIdThunk } from "@/features/caja/aplication/query/FindCorteCajaByCajaId.thunk";
import { ApiResponse } from "@/api/apiTypes";
import { CajaDto, CorteCajaDto } from "@/features/caja/domain/Caja.types";
import { CerrarCajaThunk } from "@/features/caja/aplication/usecase/CerrarCaja.thunk";


interface MovimientoState {
    movimientos: MovimientoDto[];
    loading: boolean;
    error: string | null;
}

const initialState: MovimientoState = {
    movimientos: [],
    loading: false,
    error: null,
};

const movimientoSlice = createSlice({
    name: 'movimiento',
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setMovimientos: (state, action) => {
            state.movimientos = action.payload;
            state.loading = false;
        },
        addMovimiento: (state, action) => {
            state.movimientos.push(action.payload);
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(crearEgresoThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(crearEgresoThunk.fulfilled, (state, action) => {
            state.movimientos.push(action.payload.data);
            state.loading = false;
        });
        builder.addCase(crearEgresoThunk.rejected, (state, action) => {
            state.error = action.error.message || "Error";
            state.loading = false;
        });
        builder.addCase(crearIngresoThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(crearIngresoThunk.fulfilled, (state, action) => {
            state.movimientos.push(action.payload.data);
            state.loading = false;
        });
        builder.addCase(crearIngresoThunk.rejected, (state, action) => {
            state.error = action.error.message || "Error";
            state.loading = false;
        });
        builder.addCase(findByDateQueryThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(findByDateQueryThunk.fulfilled, (state, action) => {
            state.movimientos = action.payload.data;
            state.loading = false;
        });
        builder.addCase(findByDateQueryThunk.rejected, (state, action) => {
            state.error = action.error.message || "Error";
            state.loading = false;
        });
        builder.addCase(findCorteCajaByCajaIdThunk.fulfilled,(state, action: PayloadAction<ApiResponse<CorteCajaDto>>) => {
                state.movimientos = action.payload.data?.movimientos ?? [];
        });
        builder.addCase(CerrarCajaThunk.fulfilled, (state) => {
            state.movimientos = [];
        });
    }

});
export const { setMovimientos, addMovimiento } = movimientoSlice.actions;
export default movimientoSlice.reducer;
