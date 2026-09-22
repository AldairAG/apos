import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findMaterialesThunk } from "../aplication/query/FindMaterialesThunk";
import { crearMaterialThunk } from "../aplication/usecase/CrearMaterialThunk";
import { MaterialDto } from "../domain/types/material.types";

interface MaterialPageInfo {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

interface MaterialState {
    materiales: MaterialDto[];
    pageInfo: MaterialPageInfo;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialState = {
    materiales: [],
    pageInfo: {
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
    },
    loading: false,
    error: null,
};

const materialSlice = createSlice({
    name: "material",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(findMaterialesThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findMaterialesThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.materiales = action.payload.data.content;
            state.pageInfo = action.payload.data.page;
        });
        builder.addCase(findMaterialesThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al obtener los materiales";
        });
        builder.addCase(crearMaterialThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearMaterialThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.materiales.push(action.payload.data);
        });
        builder.addCase(crearMaterialThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al crear el material";
        });
    },
});

export default materialSlice.reducer;
