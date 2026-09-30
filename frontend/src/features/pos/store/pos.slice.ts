import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findOrdenesBySucursalIdThunk } from "../aplication/query/FindOrdenesBySucursalIdThunk";
import { findProductosPosBySucursalIdThunk } from "../aplication/query/FindProductosBySucursalIdThunk";
import { actualizarEstadoOrdenThunk } from "../aplication/usecase/ActualizarEstadoOrdenThunk";
import { cobrarOrdenThunk } from "../aplication/usecase/CobrarOrdenThunk";
import { crearOrdenThunk } from "../aplication/usecase/CrearOrdenThunk";
import type { CategoriaProductoDto, OrdenDto } from "../domain/types/pos.types";

interface PosState {
    categoriasProductos: CategoriaProductoDto[];
    ordenes: OrdenDto[];
    catalogoLoading: boolean;
    ordenesLoading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: PosState = {
    categoriasProductos: [],
    ordenes: [],
    catalogoLoading: false,
    ordenesLoading: false,
    saving: false,
    error: null,
};

const upsertOrden = (ordenes: OrdenDto[], orden: OrdenDto) => {
    const index = ordenes.findIndex((item) => item.id === orden.id);
    if (index === -1) ordenes.unshift(orden);
    else ordenes[index] = orden;
};

const posSlice = createSlice({
    name: "pos",
    initialState,
    reducers: {
        limpiarErrorPos(state) {
            state.error = null;
        },
        limpiarCatalogoPos(state) {
            state.categoriasProductos = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(findProductosPosBySucursalIdThunk.pending, (state) => {
            state.catalogoLoading = true;
            state.error = null;
        });
        builder.addCase(findProductosPosBySucursalIdThunk.fulfilled, (state, action) => {
            state.catalogoLoading = false;
            state.categoriasProductos = action.payload.data;
        });
        builder.addCase(
            findProductosPosBySucursalIdThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.catalogoLoading = false;
                state.error = action.payload ?? "Error al obtener los productos";
            }
        );
        builder.addCase(findOrdenesBySucursalIdThunk.pending, (state) => {
            state.ordenesLoading = true;
            state.error = null;
        });
        builder.addCase(findOrdenesBySucursalIdThunk.fulfilled, (state, action) => {
            state.ordenesLoading = false;
            state.ordenes = action.payload.data;
        });
        builder.addCase(
            findOrdenesBySucursalIdThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.ordenesLoading = false;
                state.error = action.payload ?? "Error al obtener las órdenes";
            }
        );
        builder.addCase(crearOrdenThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(crearOrdenThunk.fulfilled, (state, action) => {
            state.saving = false;
            upsertOrden(state.ordenes, action.payload.data);
        });
        builder.addCase(actualizarEstadoOrdenThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(actualizarEstadoOrdenThunk.fulfilled, (state, action) => {
            state.saving = false;
            upsertOrden(state.ordenes, action.payload.data);
        });
        builder.addCase(cobrarOrdenThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(cobrarOrdenThunk.fulfilled, (state, action) => {
            state.saving = false;
            upsertOrden(state.ordenes, action.payload.data);
        });
        builder.addMatcher(
            (action) =>
                [
                    crearOrdenThunk.rejected.type,
                    actualizarEstadoOrdenThunk.rejected.type,
                    cobrarOrdenThunk.rejected.type,
                ].includes(action.type),
            (state, action: PayloadAction<string | undefined>) => {
                state.saving = false;
                state.error = action.payload ?? "No se pudo completar la operación";
            }
        );
    },
});

export const { limpiarErrorPos, limpiarCatalogoPos } = posSlice.actions;
export default posSlice.reducer;