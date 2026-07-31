import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Caja, CajaState, MovimientoCaja, Corte } from "./caja.types";
import { crearCajaThunk, fetchCajasBySucursalThunk, fetchMovimientosByCajaThunk,
     abrirCajaThunk,cerrarCajaThunk,hacerCorteCajaThunk,registrarGastoThunk, 
     registrarIngresoThunk,
     fetchCorteActualByCajaThunk} from "./caja.thunk";

const initialState: CajaState = {
    cajas: [],
    cajaSeleccionada: null,
    MovimientosCaja: [],
    corteActual: {
        id: 0,
        fechaInicio: "",
        fechaFin: "",
        montoInicial: 0,
        montoFinal: 0,
        efectivoCalculado: 0,
        efectivoReal: 0,
        diferencia: 0,
        tarjetas: 0,
        transferencias: 0,
        totalVentas: 0,
        totalGastos: 0,
        numeroOrdenes: 0,
        observaciones: "",
        cerrado: false,
        createdAt: "",
        updatedAt: "",
        createdBy: 0,
    },
    loading: false,
    error: null,
};

const cajaSlice = createSlice({
    name: "caja",
    initialState,
    reducers: {
        setCajaSeleccionada: (state, action: PayloadAction<Caja | null>) => {
            state.cajaSeleccionada = action.payload;
        },
        setMovimientosCaja: (state, action: PayloadAction<MovimientoCaja[]>) => {
            state.MovimientosCaja = action.payload;
        },
        setCorteActual: (state, action: PayloadAction<Corte>) => {
            state.corteActual = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(crearCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(crearCajaThunk.fulfilled, (state, action: PayloadAction<Caja>) => {
                state.loading = false;
                state.cajas.push(action.payload);
                state.cajaSeleccionada = action.payload;
            })
            .addCase(crearCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al crear la caja";
            })
            .addCase(fetchCajasBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCajasBySucursalThunk.fulfilled, (state, action: PayloadAction<Caja[]>) => {
                state.loading = false;
                state.cajas = action.payload|| [];
                state.cajaSeleccionada = (state.cajas|| []).length > 0 ? state.cajas[0] : null;
            })
            .addCase(fetchCajasBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al cargar las cajas";
            })
            .addCase(fetchMovimientosByCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovimientosByCajaThunk.fulfilled, (state, action: PayloadAction<Caja>) => {
                state.loading = false;
                state.cajaSeleccionada = action.payload;
            })
            .addCase(fetchMovimientosByCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al cargar los movimientos de la caja";
            })
            .addCase(abrirCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(abrirCajaThunk.fulfilled, (state, action: PayloadAction<Caja>) => {
                state.loading = false;
                state.cajaSeleccionada = action.payload;
            })
            .addCase(abrirCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al abrir la caja";
            })
            .addCase(cerrarCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cerrarCajaThunk.fulfilled, (state, action: PayloadAction<Caja>) => {
                state.loading = false;
                state.cajaSeleccionada = action.payload;
            })
            .addCase(cerrarCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al cerrar la caja";
            })
            .addCase(hacerCorteCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(hacerCorteCajaThunk.fulfilled, (state, action: PayloadAction<Caja>) => {
                state.loading = false;
                state.cajaSeleccionada = action.payload;
            })
            .addCase(hacerCorteCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al hacer el corte de caja";
            })
            .addCase(registrarGastoThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registrarGastoThunk.fulfilled, (state, action: PayloadAction<MovimientoCaja>) => {
                state.loading = false;
                state.MovimientosCaja.push(action.payload);
            })
            .addCase(registrarGastoThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al registrar el gasto";
            })
            .addCase(registrarIngresoThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registrarIngresoThunk.fulfilled, (state, action: PayloadAction<MovimientoCaja>) => {
                state.loading = false;
                state.MovimientosCaja.push(action.payload);
            })
            .addCase(registrarIngresoThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al registrar el ingreso";
            })
            .addCase(fetchCorteActualByCajaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCorteActualByCajaThunk.fulfilled, (state, action: PayloadAction<MovimientoCaja[]>) => {
                state.loading = false;
                state.MovimientosCaja = action.payload;
            })
            .addCase(fetchCorteActualByCajaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error al cargar el corte actual de la caja";
            });

                
            
    },
});

export const { setCajaSeleccionada, setMovimientosCaja, setCorteActual, clearError } = cajaSlice.actions;
export default cajaSlice.reducer;


