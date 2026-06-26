import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MesaPosResponseDTO, ProductosBySucursalResponse } from "./pos.types";
import { fetchProductosBySucursalThunk } from "./pos.thunks";

interface POSState {
    productos: ProductosBySucursalResponse[];
    selectedProducto: ProductosBySucursalResponse | null;
    mesas: MesaPosResponseDTO[];
    selectedMesa: MesaPosResponseDTO | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
}

const initialState: POSState = {
    productos: [],
    mesas: [],
    selectedProducto: null,
    selectedMesa: null,
    loading: false,
    error: null,
    searchQuery: '',
};

const productoSlice = createSlice({
    name: 'producto',
    initialState,
    reducers: {
        setSelectedProducto: (state, action: PayloadAction<ProductosBySucursalResponse | null>) => {
            state.selectedProducto = action.payload;
        },
        setSelectedMesa: (state, action: PayloadAction<MesaPosResponseDTO | null>) => {
            state.selectedMesa = action.payload;
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
            .addCase(fetchProductosBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductosBySucursalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.productos = action.payload;
            })
            .addCase(fetchProductosBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(fetchProductosBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductosBySucursalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.productos = action.payload;
            })
            .addCase(fetchProductosBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(fetchProductosBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductosBySucursalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.productos = action.payload;
            })
            .addCase(fetchProductosBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    }
})
