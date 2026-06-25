import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    changeMesaEstado,
    createMesa,
    deleteMesa,
    fetchMesaById,
    fetchMesasBySucursal,
    updateMesa,
} from './mesa.thunk';
import { Mesa, MesaState } from './mesas.types';

const initialState: MesaState = {
  mesas: [],
  selectedMesa: null,
  loading: false,
  error: null,
};

const mesaSlice = createSlice({
  name: 'mesa',
  initialState,
  reducers: {
    setSelectedMesa: (state, action: PayloadAction<Mesa | null>) => {
      state.selectedMesa = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMesas: (state) => {
      state.mesas = [];
      state.selectedMesa = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMesasBySucursal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMesasBySucursal.fulfilled, (state, action) => {
        state.loading = false;
        state.mesas = action.payload ?? [];
      })
      .addCase(fetchMesasBySucursal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMesaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMesaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMesa = action.payload ?? null;
      })
      .addCase(fetchMesaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMesa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMesa.fulfilled, (state, action) => {
        state.loading = false;
        state.mesas = state.mesas ?? [];
        if (action.payload) {
          state.mesas.push(action.payload);
        }
      })
      .addCase(createMesa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMesa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMesa.fulfilled, (state, action) => {
        state.loading = false;
        state.mesas = state.mesas ?? [];
        const index = state.mesas.findIndex((mesa) => mesa.id === action.payload.id);
        if (index !== -1) {
          state.mesas[index] = action.payload;
        }
        if (state.selectedMesa?.id === action.payload.id) {
          state.selectedMesa = action.payload;
        }
      })
      .addCase(updateMesa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMesa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMesa.fulfilled, (state, action) => {
        state.loading = false;
        state.mesas = state.mesas ?? [];
        state.mesas = state.mesas.filter((mesa) => mesa.id !== action.payload);
        if (state.selectedMesa?.id === action.payload) {
          state.selectedMesa = null;
        }
      })
      .addCase(deleteMesa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changeMesaEstado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeMesaEstado.fulfilled, (state, action) => {
        state.loading = false;
        state.mesas = state.mesas ?? [];
        const index = state.mesas.findIndex((mesa) => mesa.id === action.payload.id);
        if (index !== -1) {
          state.mesas[index] = action.payload;
        }
        if (state.selectedMesa?.id === action.payload.id) {
          state.selectedMesa = action.payload;
        }
      })
      .addCase(changeMesaEstado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMesa, clearError, clearMesas } = mesaSlice.actions;
export default mesaSlice.reducer;
