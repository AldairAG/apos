import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createReceta,
    deleteReceta,
    fetchRecetas,
    fetchRecetasBySucursal,
    updateReceta,
} from './receta.thunks';
import {Receta } from './receta.types';


const initialState: {
    recetas: Receta[];
    recetaSeleccionada: Receta | null;
    loading: boolean;
    error: string | null;
} = {
    recetas: [],
    recetaSeleccionada: null,
    loading: false,
    error: null,
};

const recetasSlice = createSlice({
  name: 'recetas',
  initialState,
  reducers: {
    setRecetaSeleccionada: (state, action: PayloadAction<Receta | null>) => {
      state.recetaSeleccionada = action.payload;
    },
    clearError: (state) => {
      state.error = null;   
    },
    clearRecetas: (state) => {
      state.recetas = [];
      state.recetaSeleccionada = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch todas las recetas
    builder.addCase(fetchRecetas.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecetas.fulfilled, (state, action) => {
      state.loading = false;
      state.recetas = action.payload;
    });
    builder.addCase(fetchRecetas.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchRecetasBySucursal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecetasBySucursal.fulfilled, (state, action) => {
      state.loading = false;
      state.recetas = action.payload;
    });
    builder.addCase(fetchRecetasBySucursal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    // Create receta
    builder.addCase(createReceta.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createReceta.fulfilled, (state, action) => {
      state.loading = false;
      state.recetas.push(action.payload);
    });
    builder.addCase(createReceta.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update receta
    builder.addCase(updateReceta.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateReceta.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.recetas.findIndex((receta) => receta.id === action.payload.id);
      if (index !== -1) {
        state.recetas[index] = action.payload;
      }
      if (state.recetaSeleccionada?.id === action.payload.id) {
        state.recetaSeleccionada = action.payload;
      }
    });
    builder.addCase(updateReceta.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete receta
    builder.addCase(deleteReceta.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteReceta.fulfilled, (state, action) => {
      state.loading = false;
      state.recetas = state.recetas.filter((receta) => receta.id !== action.payload);
      if (state.recetaSeleccionada?.id === action.payload) {
        state.recetaSeleccionada = null;
      }
    });
    builder.addCase(deleteReceta.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

  },
});

export const { setRecetaSeleccionada, clearError, clearRecetas } = recetasSlice.actions;


export default recetasSlice.reducer;