import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Mesa } from './mesas.types';
import categoriaSlice from '../producto/categoria/categoria.slice';
import { fetchMesasBySucursalId } from './mesa.thunk';

interface MesaState {
    mesas: Mesa[];
    selectedMesa: Mesa | null;
    loading: boolean;
    error: string | null;
}

const initialState: MesaState = {
    mesas: [],
    selectedMesa: null,
    loading: false,
    error: null,
};

const mesaSlice = createSlice({
    name: 'mesa',
    initialState,
    reducers: {
        setSelectedMesa: (state, action: PayloadAction<Mesa | null>) => {
            state.selectedMesa = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch mesas
        builder
            .addCase(fetchMesasBySucursalId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMesasBySucursalId.fulfilled, (state, action) => {
                state.loading = false;
                state.mesas = action.payload;
            })
            .addCase(fetchMesasBySucursalId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

export const { setSelectedMesa, clearError } = mesaSlice.actions;
export default mesaSlice.reducer;