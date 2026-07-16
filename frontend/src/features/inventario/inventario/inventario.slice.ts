import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventarioState, MaterialDTO } from './inventario.types';
import { fetchInventarioBySucursal, ajustarExistencia, hacerProduccion } from './inventario.thunk';

const initialState: InventarioState = {
    materiales: [],
    materialSeleccionado: null,
    loading: false,
    error: null,
};

const materialesSlice = createSlice({
    name: 'inventario',
    initialState,
    reducers: {
        setMaterialSeleccionado: (state, action: PayloadAction<MaterialDTO | null>) => {
            state.materialSeleccionado = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearMateriales: (state) => {
            state.materiales = [];
            state.materialSeleccionado = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch inventario por sucursal
        builder.addCase(fetchInventarioBySucursal.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchInventarioBySucursal.fulfilled, (state, action) => {
            state.loading = false;
            state.materiales = action.payload;
        });
        builder.addCase(fetchInventarioBySucursal.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        // Ajustar existencia
        builder.addCase(ajustarExistencia.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(ajustarExistencia.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.materiales.findIndex((m) => m.id === action.payload.id);
            if (index !== -1) {
                state.materiales[index] = action.payload;
            }
        });
        builder.addCase(ajustarExistencia.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        // Hacer producción
        builder.addCase(hacerProduccion.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(hacerProduccion.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.materiales.findIndex((m) => m.id === action.payload.id);
            if (index !== -1) {
                state.materiales[index] = action.payload;
            }
        });
        builder.addCase(hacerProduccion.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { setMaterialSeleccionado, clearError, clearMateriales } = materialesSlice.actions;
export default materialesSlice.reducer;