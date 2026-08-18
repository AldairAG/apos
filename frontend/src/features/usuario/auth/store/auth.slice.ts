import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadFromSessionStorage } from '../infrestructure/auth.helpers';
import { loginThunk } from '../aplication/useCase/login.thunk';
import { registroThunk } from '../aplication/useCase/registro.thunk';

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
            .addCase(registroThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registroThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
                state.id = action.payload.data.id;
                state.error = null;
            })
            .addCase(registroThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error en el registro';
            })
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
                state.error = null;
                state.id = action.payload.data.id;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error en el login';
            });
    },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
