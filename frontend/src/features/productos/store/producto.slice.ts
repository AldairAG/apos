import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findProductosByEmpresaThunk } from "../aplication/query/FindProductosByEmpresaThunk";
import { crearProductoThunk } from "../aplication/usecase/CrearProductoThunk";
import { actualizarProductoThunk } from "../aplication/usecase/ActualizarProductoThunk";
import { eliminarProductoThunk } from "../aplication/usecase/EliminarProductoThunk";
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
        builder.addCase(findProductosByEmpresaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findProductosByEmpresaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.productos = action.payload.data;
        });
        builder.addCase(
            findProductosByEmpresaThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al obtener los productos";
            }
        );
        builder.addCase(crearProductoThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearProductoThunk.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(
            crearProductoThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al crear el producto";
            }
        );
        builder.addCase(actualizarProductoThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(actualizarProductoThunk.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(
            actualizarProductoThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al actualizar el producto";
            }
        );
        builder.addCase(eliminarProductoThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(eliminarProductoThunk.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(
            eliminarProductoThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al eliminar el producto";
            }
        );
    },
});

export const { limpiarErrorProducto, limpiarProductos } = productoSlice.actions;
export default productoSlice.reducer;