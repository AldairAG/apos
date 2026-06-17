import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSucursal, fetchSucursales } from './sucursal.thunk';
import { Sucursal, SucursalState } from './sucursal.types';

const SUCURSAL_STORAGE_KEY = 'sucursalActual';

// Cargar sucursal actual desde sessionStorage
const loadSucursalFromStorage = (): Sucursal | null => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(SUCURSAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (error) {
    console.error('Error loading sucursal from storage:', error);
  }
  return null;
};

// Guardar sucursal actual en sessionStorage
const saveSucursalToStorage = (sucursal: Sucursal | null) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sucursal) {
        sessionStorage.setItem(SUCURSAL_STORAGE_KEY, JSON.stringify(sucursal));
      } else {
        sessionStorage.removeItem(SUCURSAL_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Error saving sucursal to storage:', error);
  }
};

const initialState: SucursalState = {
  sucursalActual: loadSucursalFromStorage(),
  sucursales: [],
  loading: false,
  error: null,
};

const sucursalSlice = createSlice({
  name: 'sucursal',
  initialState,
  reducers: {
    setSucursalActual: (state, action: PayloadAction<Sucursal>) => {
      state.sucursalActual = action.payload;
      saveSucursalToStorage(action.payload);
    },
    clearSucursalActual: (state) => {
      state.sucursalActual = null;
      saveSucursalToStorage(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sucursales
    builder.addCase(fetchSucursales.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSucursales.fulfilled, (state, action) => {
      state.loading = false;
      state.sucursales = action.payload;
    });
    builder.addCase(fetchSucursales.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create sucursal
    builder.addCase(createSucursal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSucursal.fulfilled, (state, action) => {
      state.loading = false;
      state.sucursales.push(action.payload);
      // Auto-seleccionar la sucursal recién creada
      state.sucursalActual = action.payload;
      saveSucursalToStorage(action.payload);
    });
    builder.addCase(createSucursal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSucursalActual, clearSucursalActual, clearError } = sucursalSlice.actions;
export default sucursalSlice.reducer;
