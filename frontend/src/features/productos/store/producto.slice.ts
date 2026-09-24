import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findProductosBySucursalThunk } from "../aplication/query/FindProductosBySucursalThunk";
import { crearProductoThunk } from "../aplication/usecase/CrearProductoThunk";
import type { ProductoDto } from "../domain/types/producto.types";

interface ProductoState {
    productos: ProductoDto[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductoState = {
    productos: [],
    loading: false,
    error: null,
};

const productoSlice = createSlice({
    name: "producto",
    initialState,
    reducers: {
        limpiarProductos(state) {
            state.productos = [];
        },
        limpiarErrorProducto(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(findProductosBySucursalThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findProductosBySucursalThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.productos = action.payload.data;
        });
        builder.addCase(
            findProductosBySucursalThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al obtener los productos";
            }
        );
        builder.addCase(crearProductoThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearProductoThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.productos.push(action.payload.data);
        });
        builder.addCase(
            crearProductoThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al crear el producto";
            }
        );
    },
});

export const { limpiarErrorProducto, limpiarProductos } = productoSlice.actions;
export default productoSlice.reducer;