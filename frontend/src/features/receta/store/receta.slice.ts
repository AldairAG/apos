import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findRecetasThunk } from "../aplication/query/FindRecetasThunk";
import { crearRecetaThunk } from "../aplication/usecase/CrearRecetaThunk";
import { deleteRecetaThunk } from "../aplication/usecase/DeleteRecetaThunk";
import { updateRecetaThunk } from "../aplication/usecase/UpdateRecetaThunk";
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
    recetaCopia?: RecetaDto;
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
    reducers: {
        setRecetaCopia: (state, action: PayloadAction<RecetaDto>) => {
            state.recetaCopia = action.payload;
        },
        clearRecetaCopia: (state) => {
            state.recetaCopia = undefined;
        },
    },
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
        builder.addCase(deleteRecetaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteRecetaThunk.fulfilled, (state, action) => {
            state.loading = false;
            // Actualizar la lista después de eliminar
            // Esto lo manejará el componente refrescando la lista
        });
        builder.addCase(deleteRecetaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al eliminar la receta";
        });
        builder.addCase(updateRecetaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateRecetaThunk.fulfilled, (state, action) => {
            state.loading = false;
            // Actualizar la receta en la lista
            const index = state.recetas.findIndex((r) => r.id === action.payload.data.id);
            if (index !== -1) {
                state.recetas[index] = action.payload.data;
            }
        });
        builder.addCase(updateRecetaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al actualizar la receta";
        });
    },
});

export const { setRecetaCopia, clearRecetaCopia } = recetaSlice.actions;
export default recetaSlice.reducer;
