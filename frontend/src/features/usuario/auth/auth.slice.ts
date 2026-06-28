import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { loadFromSessionStorage, removeFromSessionStorage, saveToSessionStorage } from './auth.helpers';
import { login, registro } from './auth.thunk';


interface AuthState {
    token: string | null;
    id: number | null | string;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// Cargar estado inicial desde sessionStorage
const loadInitialState = (): AuthState => {
    const savedUser = loadFromSessionStorage('auth_user');
    const savedId = loadFromSessionStorage('auth_id');
    const savedToken = loadFromSessionStorage('auth_token');

    return {
        token: savedToken,
        id: savedId,
        loading: false,
        error: null,
        isAuthenticated: !!(savedUser && savedToken),
    };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registro.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registro.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
                state.id = action.payload.data.id;
                state.error = null;
            })
            .addCase(registro.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error en el registro';
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
                state.error = null;
                state.id = action.payload.data.id;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error en el login';
            });
    },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
