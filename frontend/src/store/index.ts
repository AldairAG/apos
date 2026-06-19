import { configureStore } from '@reduxjs/toolkit';
import { apiBase } from '../api/apiBase';
import materialesReducer from '../features/inventario/materiales/materiales.slice';
import sucursalReducer from '../features/sucursal/sucursal.slice';
import authReducer from '../features/usuario/auth/auth.slice';
import recetaReducer from '../features/producto/receta/receta.slice';
import usuarioReducer from '../features/usuario/usuario/usuario.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        sucursal: sucursalReducer,
        materiales: materialesReducer,
        recetas: recetaReducer,
        usuario: usuarioReducer,
    },
}); 
// Inicializar el token de apiBase desde sessionStorage al cargar la aplicación
apiBase.initializeAuthFromStorage().catch(console.error);

// Suscribirse a cambios de autenticación para sincronizar el token
store.subscribe(() => {
    const state = store.getState();
    if (state.auth.token) {
        apiBase.syncTokenFromRedux();
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;