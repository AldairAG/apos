import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findCategoriasBySucursalThunk } from "../aplication/query/FindCategoriasBySucursalThunk";
import { crearCategoriaThunk } from "../aplication/usecase/CrearCategoriaThunk";
import type { CategoriaDto } from "../domain/types/categoria.types";

interface CategoriaState {
    categorias: CategoriaDto[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoriaState = {
    categorias: [],
    loading: false,
    error: null,
};

const categoriaSlice = createSlice({
    name: "categoria",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(findCategoriasBySucursalThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findCategoriasBySucursalThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.categorias = action.payload.data;
        });
        builder.addCase(
            findCategoriasBySucursalThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al obtener las categorías";
            }
        );
        builder.addCase(crearCategoriaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearCategoriaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.categorias.push(action.payload.data);
        });
        builder.addCase(
            crearCategoriaThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al crear la categoría";
            }
        );
    },
});

export default categoriaSlice.reducer;
