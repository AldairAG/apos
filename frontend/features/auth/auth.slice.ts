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
}

const initialState: AuthState = {
  token: null,
  usuario: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; usuario: Usuario }>
    ) => {
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.usuario = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
