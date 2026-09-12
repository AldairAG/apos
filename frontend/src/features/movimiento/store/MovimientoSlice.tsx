import { createSlice } from "@reduxjs/toolkit";
import { crearEgresoThunk } from "../aplication/usecase/CrearEgresoThunk";
import { crearIngresoThunk } from "../aplication/usecase/CrearIngresoThunk";
import { findByDateQueryThunk } from "../aplication/query/FindByDateQueryThunk";
import { MovimientoDto } from "../domain/types/Movimiento.types";


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
    }

});

export default movimientoSlice.reducer;
