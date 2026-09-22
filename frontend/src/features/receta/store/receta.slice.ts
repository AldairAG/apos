import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findRecetasThunk } from "../aplication/query/FindRecetasThunk";
import { crearRecetaThunk } from "../aplication/usecase/CrearRecetaThunk";
import { RecetaDto } from "../domain/types/receta.types";

interface RecetaPageInfo {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

interface RecetaState {
    recetas: RecetaDto[];
    pageInfo: RecetaPageInfo;
    loading: boolean;
    error: string | null;
}

const initialState: RecetaState = {
    recetas: [],
    pageInfo: {
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
    },
    loading: false,
    error: null,
};

const recetaSlice = createSlice({
    name: "receta",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(findRecetasThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findRecetasThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.recetas = action.payload.data.content;
            state.pageInfo = action.payload.data.page;
        });
        builder.addCase(findRecetasThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al obtener las recetas";
        });
        builder.addCase(crearRecetaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearRecetaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.recetas.push(action.payload.data);
        });
        builder.addCase(crearRecetaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al crear la receta";
        });
    },
});

export default recetaSlice.reducer;
