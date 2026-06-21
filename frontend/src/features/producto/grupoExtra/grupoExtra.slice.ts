import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createGrupoExtra,
    createOpcionExtra,
    deleteGrupoExtra,
    deleteOpcionExtra,
    fetchGrupoExtraById,
    fetchGruposExtra,
    updateGrupoExtra,
    updateOpcionExtra,
} from './grupoExtra.thunk';
import { GrupoExtra, GrupoExtraState } from './grupoExtra.types';

const initialState: GrupoExtraState = {
  grupos: [],
  selectedGrupo: null,
  loading: false,
  error: null,
};

const grupoExtraSlice = createSlice({
  name: 'grupoExtra',
  initialState,
  reducers: {
    setSelectedGrupo: (state, action: PayloadAction<GrupoExtra | null>) => {
      state.selectedGrupo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch grupos extra
    builder
      .addCase(fetchGruposExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGruposExtra.fulfilled, (state, action) => {
        state.loading = false;
        state.grupos = action.payload;
      })
      .addCase(fetchGruposExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch grupo by id
    builder
      .addCase(fetchGrupoExtraById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrupoExtraById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGrupo = action.payload;
      })
      .addCase(fetchGrupoExtraById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create grupo
    builder
      .addCase(createGrupoExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGrupoExtra.fulfilled, (state, action) => {
        state.loading = false;
        state.grupos.push(action.payload);
      })
      .addCase(createGrupoExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update grupo
    builder
      .addCase(updateGrupoExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGrupoExtra.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.grupos.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.grupos[index] = action.payload;
        }
        if (state.selectedGrupo?.id === action.payload.id) {
          state.selectedGrupo = action.payload;
        }
      })
      .addCase(updateGrupoExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete grupo
    builder
      .addCase(deleteGrupoExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGrupoExtra.fulfilled, (state, action) => {
        state.loading = false;
        state.grupos = state.grupos.filter(g => g.id !== action.payload);
        if (state.selectedGrupo?.id === action.payload) {
          state.selectedGrupo = null;
        }
      })
      .addCase(deleteGrupoExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create opcion
    builder
      .addCase(createOpcionExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOpcionExtra.fulfilled, (state, action) => {
        state.loading = false;
        // Add opcion to selected grupo
        if (state.selectedGrupo?.id === action.payload.grupoExtraId) {
          state.selectedGrupo.opciones.push(action.payload);
        }
        // Update in grupos list
        const grupoIndex = state.grupos.findIndex(g => g.id === action.payload.grupoExtraId);
        if (grupoIndex !== -1) {
          state.grupos[grupoIndex].opciones.push(action.payload);
        }
      })
      .addCase(createOpcionExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update opcion
    builder
      .addCase(updateOpcionExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOpcionExtra.fulfilled, (state, action) => {
        state.loading = false;
        // Update in selected grupo
        if (state.selectedGrupo?.id === action.payload.grupoExtraId) {
          const opcionIndex = state.selectedGrupo.opciones.findIndex(o => o.id === action.payload.id);
          if (opcionIndex !== -1) {
            state.selectedGrupo.opciones[opcionIndex] = action.payload;
          }
        }
        // Update in grupos list
        const grupoIndex = state.grupos.findIndex(g => g.id === action.payload.grupoExtraId);
        if (grupoIndex !== -1) {
          const opcionIndex = state.grupos[grupoIndex].opciones.findIndex(o => o.id === action.payload.id);
          if (opcionIndex !== -1) {
            state.grupos[grupoIndex].opciones[opcionIndex] = action.payload;
          }
        }
      })
      .addCase(updateOpcionExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete opcion
    builder
      .addCase(deleteOpcionExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOpcionExtra.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from selected grupo
        if (state.selectedGrupo) {
          state.selectedGrupo.opciones = state.selectedGrupo.opciones.filter(o => o.id !== action.payload);
        }
        // Remove from grupos list
        state.grupos.forEach(grupo => {
          grupo.opciones = grupo.opciones.filter(o => o.id !== action.payload);
        });
      })
      .addCase(deleteOpcionExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedGrupo, clearError } = grupoExtraSlice.actions;
export default grupoExtraSlice.reducer;
