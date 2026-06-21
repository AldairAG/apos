import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createProducto,
    deleteProducto,
    fetchProductoById,
    fetchProductosBySucursal,
    searchProductos,
    toggleProductoDisponibilidad,
    updateProducto,
} from './producto.thunk';
import { Producto, ProductoState } from './producto.types';

const initialState: ProductoState = {
  productos: [],
  selectedProducto: null,
  loading: false,
  error: null,
  searchQuery: '',
};

const productoSlice = createSlice({
  name: 'producto',
  initialState,
  reducers: {
    setSelectedProducto: (state, action: PayloadAction<Producto | null>) => {
      state.selectedProducto = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProductos: (state) => {
      state.productos = [];
      state.selectedProducto = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch productos by sucursal
    builder
      .addCase(fetchProductosBySucursal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductosBySucursal.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(fetchProductosBySucursal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search productos
    builder
      .addCase(searchProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(searchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch producto by id
    builder
      .addCase(fetchProductoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductoById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProducto = action.payload;
      })
      .addCase(fetchProductoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create producto
    builder
      .addCase(createProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProducto.fulfilled, (state, action) => {
        state.loading = false;
        state.productos.push(action.payload);
      })
      .addCase(createProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update producto
    builder
      .addCase(updateProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProducto.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.productos[index] = action.payload;
        }
        if (state.selectedProducto?.id === action.payload.id) {
          state.selectedProducto = action.payload;
        }
      })
      .addCase(updateProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete producto
    builder
      .addCase(deleteProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProducto.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = state.productos.filter(p => p.id !== action.payload);
        if (state.selectedProducto?.id === action.payload) {
          state.selectedProducto = null;
        }
      })
      .addCase(deleteProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle disponibilidad
    builder
      .addCase(toggleProductoDisponibilidad.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductoDisponibilidad.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.productos[index] = action.payload;
        }
      })
      .addCase(toggleProductoDisponibilidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedProducto, 
  setSearchQuery, 
  clearError, 
  clearProductos 
} = productoSlice.actions;

export default productoSlice.reducer;
