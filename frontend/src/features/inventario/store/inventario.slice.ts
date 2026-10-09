import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { obtenerInventarioThunk } from "../aplication/query/ObtenerInventarioThunk";
import { obtenerMovimientosThunk } from "../aplication/query/ObtenerMovimientosThunk";
import { producirMaterialThunk } from "../aplication/usecase/ProducirMaterialThunk";
import { registrarMovimientoThunk } from "../aplication/usecase/RegistrarMovimientoThunk";
import type { ExistenciaDto, InventarioPage, MovimientoInventarioDto } from "../domain/types/inventario.types";
import { editarExistenciaMinimaThunk } from "../aplication/usecase/EditarExistenciaMinima";

interface InventarioState {
    existencias: ExistenciaDto[];
    movimientos: MovimientoInventarioDto[];
    pageInfo: Pick<InventarioPage<ExistenciaDto>, "page" | "size" | "totalElements" | "totalPages" | "last">;
    movimientosPageInfo: Pick<InventarioPage<MovimientoInventarioDto>, "page" | "size" | "totalElements" | "totalPages" | "last">;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: InventarioState = {
    existencias: [],
    movimientos: [],
    pageInfo: { page: 0, size: 100, totalElements: 0, totalPages: 0, last: true },
    movimientosPageInfo: { page: 0, size: 100, totalElements: 0, totalPages: 0, last: true },
    loading: false,
    saving: false,
    error: null,
};

const inventarioSlice = createSlice({
    name: "inventario",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(obtenerInventarioThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(obtenerInventarioThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.existencias = action.payload.data.content;
            const { content: _content, ...pageInfo } = action.payload.data;
            state.pageInfo = pageInfo;
        });
        builder.addCase(obtenerInventarioThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al consultar inventario";
        });
        builder.addCase(obtenerMovimientosThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(obtenerMovimientosThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.movimientos = action.payload.data.content;
            const { content: _content, ...pageInfo } = action.payload.data;
            state.movimientosPageInfo = pageInfo;
        });
        builder.addCase(obtenerMovimientosThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al consultar movimientos";
        });
        builder.addCase(registrarMovimientoThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(registrarMovimientoThunk.fulfilled, (state) => {
            state.saving = false;
        });
        builder.addCase(registrarMovimientoThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.saving = false;
            state.error = action.payload ?? "Error al registrar el movimiento";
        });
        builder.addCase(producirMaterialThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(producirMaterialThunk.fulfilled, (state) => {
            state.saving = false;
        });
        builder.addCase(producirMaterialThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.saving = false;
            state.error = action.payload ?? "Error al producir material";
        });
        builder.addCase(editarExistenciaMinimaThunk.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(editarExistenciaMinimaThunk.fulfilled, (state) => {
            state.saving = false;
        });
        builder.addCase(editarExistenciaMinimaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.saving = false;
            state.error = action.payload ?? "Error al editar la existencia mínima";
        });
    },
});

export default inventarioSlice.reducer;