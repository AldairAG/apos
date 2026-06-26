import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MesaPosResponseDTO, OrdenResponseDTO, ProductosBySucursalResponse } from "./pos.types";
import { createOrdenThunk, fetchMesasBySucursalThunk, fetchOrdenesBySucursalThunk, fetchProductosBySucursalThunk } from "./pos.thunks";

interface POSState {
    productos: ProductosBySucursalResponse[];
    selectedProducto: ProductosBySucursalResponse | null;
    mesas: MesaPosResponseDTO[];
    selectedMesa: MesaPosResponseDTO | null;
    ordenes: OrdenResponseDTO[]; // Replace 'any' with the appropriate type for your orders
    loading: boolean;
    error: string | null;
    searchQuery: string;
}

const initialState: POSState = {
    ordenes: [],
    productos: [],
    mesas: [],
    selectedProducto: null,
    selectedMesa: null,
    loading: false,
    error: null,
    searchQuery: '',
};

const posSlice = createSlice({
    name: 'pos',
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
            .addCase(fetchOrdenesBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrdenesBySucursalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.ordenes = action.payload;
            })
            .addCase(fetchOrdenesBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(createOrdenThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrdenThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.ordenes = [...state.ordenes, action.payload];
            })
            .addCase(createOrdenThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(fetchMesasBySucursalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMesasBySucursalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.mesas = action.payload;
            })
            .addCase(fetchMesasBySucursalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    }
})
export const { setSearchQuery,setSelectedMesa,clearError,clearProductos,setSelectedProducto  } = posSlice.actions;
export default posSlice.reducer;
