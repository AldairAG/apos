import { JwtResponse } from '@/api/apiBase';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Usuario {
  id: number;
  email: string;
  rol: string;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  usuario: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<JwtResponse>) => {
      state.token = action.payload.token;
      state.usuario = {
        id: action.payload.id,
        email: action.payload.email,
        rol: 'USER',
      };
      state.isAuthenticated = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<JwtResponse>) => {
      state.token = action.payload.token;
      state.usuario = {
        id: action.payload.id,
        email: action.payload.email,
        rol: 'USER',
      };
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; usuario: Usuario }>
    ) => {
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.usuario = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export const { loginSuccess, registerSuccess, loginFailure, registerFailure, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
