import { createSlice, PayloadAction } from "@reduxjs/toolkit";
<<<<<<< HEAD
import { cancelOrdenThunk, createOrdenThunk, fetchMesasBySucursalThunk, fetchOrdenesBySucursalThunk, fetchProductosBySucursalThunk } from "./pos.thunks";
import { EstadoOrden, MesaPosResponseDTO, OrdenResponseDTO, ProductosBySucursalResponse } from "./pos.types";
=======
import { cancelOrdenThunk, createOrdenThunk, fetchMesasBySucursalThunk, fetchOrdenesBySucursalThunk, fetchProductosBySucursalThunk, updateOrdenEstadoThunk } from "./pos.thunks";
import { MesaPosResponseDTO, OrdenResponseDTO, ProductosBySucursalResponse } from "./pos.types";
>>>>>>> 98d90cdc3691886b5de74b80a90685c782aba913

interface POSState {
    productos: ProductosBySucursalResponse[];
    selectedProducto: ProductosBySucursalResponse | null;
    mesas: MesaPosResponseDTO[];
    selectedMesa: MesaPosResponseDTO | null;
    ordenes: OrdenResponseDTO[]; // Replace 'any' with the appropriate type for your orders
    ordenSelected: OrdenResponseDTO | null;
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
    ordenSelected: null,
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
        agregarOrden: (state, action: PayloadAction<OrdenResponseDTO>) => {
            state.ordenes.push(action.payload);
        },
        actualizarOrden: (state, action: PayloadAction<OrdenResponseDTO>) => {
            const index =state.ordenes.findIndex(o => o.id === action.payload.id);
            if (index >= 0) {
                state.ordenes[index] =action.payload;
            }
        }
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
            .addCase(cancelOrdenThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrdenThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.ordenes = state.ordenes.map((orden) =>
                    orden.id === action.payload.id
                        ? { ...orden, estado: EstadoOrden.CANCELADA }
                        : orden
                );
            })
            .addCase(cancelOrdenThunk.rejected, (state, action) => {
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
        builder
            .addCase(updateOrdenEstadoThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrdenEstadoThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.ordenes = state.ordenes.map((orden) =>
                    orden.id === action.payload.id ? action.payload : orden
                );
            })
            .addCase(updateOrdenEstadoThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(cancelOrdenThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrdenThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.ordenes = state.ordenes.map((orden) =>
                    orden.id === action.payload
                        ? { ...orden, estado: 'CANCELADA' }
                        : orden
                );
            })
            .addCase(cancelOrdenThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    }
})
export const { setSearchQuery, setSelectedMesa, clearError, clearProductos, setSelectedProducto, agregarOrden, actualizarOrden } = posSlice.actions;
export default posSlice.reducer;
