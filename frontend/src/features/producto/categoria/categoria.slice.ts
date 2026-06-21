import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createCategoria,
    deleteCategoria,
    fetchCategoriaById,
    fetchCategorias,
    updateCategoria,
} from './categoria.thunk';
import { Categoria, CategoriaState } from './categoria.types';

const initialState: CategoriaState = {
  categorias: [],
  selectedCategoria: null,
  loading: false,
  error: null,
};

const categoriaSlice = createSlice({
  name: 'categoria',
  initialState,
  reducers: {
    setSelectedCategoria: (state, action: PayloadAction<Categoria | null>) => {
      state.selectedCategoria = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categorias
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.loading = false;
        state.categorias = action.payload;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch categoria by id
    builder
      .addCase(fetchCategoriaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategoria = action.payload;
      })
      .addCase(fetchCategoriaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create categoria
    builder
      .addCase(createCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoria.fulfilled, (state, action) => {
        state.loading = false;
        state.categorias.push(action.payload);
      })
      .addCase(createCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update categoria
    builder
      .addCase(updateCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoria.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categorias.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categorias[index] = action.payload;
        }
        if (state.selectedCategoria?.id === action.payload.id) {
          state.selectedCategoria = action.payload;
        }
      })
      .addCase(updateCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete categoria
    builder
      .addCase(deleteCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.loading = false;
        state.categorias = state.categorias.filter(c => c.id !== action.payload);
        if (state.selectedCategoria?.id === action.payload) {
          state.selectedCategoria = null;
        }
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategoria, clearError } = categoriaSlice.actions;
export default categoriaSlice.reducer;
