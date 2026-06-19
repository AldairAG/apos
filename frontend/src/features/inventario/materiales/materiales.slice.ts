import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createMaterial,
    deleteMaterial,
    fetchMateriales,
    fetchMaterialesBySucursal,
    updateMaterial,
} from './materiales.thunk';
import { Material, MaterialState } from './materiales.types';

const initialState: MaterialState = {
  materiales: [],
  materialSeleccionado: null,
  loading: false,
  error: null,
};

const materialesSlice = createSlice({
  name: 'materiales',
  initialState,
  reducers: {
    setMaterialSeleccionado: (state, action: PayloadAction<Material | null>) => {
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
    // Fetch todos los materiales
    builder.addCase(fetchMateriales.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMateriales.fulfilled, (state, action) => {
      state.loading = false;
      state.materiales = action.payload;
    });
    builder.addCase(fetchMateriales.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch materiales por sucursal
    builder.addCase(fetchMaterialesBySucursal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMaterialesBySucursal.fulfilled, (state, action) => {
      state.loading = false;
      state.materiales = action.payload;
    });
    builder.addCase(fetchMaterialesBySucursal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create material
    builder.addCase(createMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.materiales.push(action.payload);
    });
    builder.addCase(createMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update material
    builder.addCase(updateMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMaterial.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.materiales.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.materiales[index] = action.payload;
      }
      if (state.materialSeleccionado?.id === action.payload.id) {
        state.materialSeleccionado = action.payload;
      }
    });
    builder.addCase(updateMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete material
    builder.addCase(deleteMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.materiales = state.materiales.filter((m) => m.id !== action.payload);
      if (state.materialSeleccionado?.id === action.payload) {
        state.materialSeleccionado = null;
      }
    });
    builder.addCase(deleteMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setMaterialSeleccionado, clearError, clearMateriales } = materialesSlice.actions;
export default materialesSlice.reducer;