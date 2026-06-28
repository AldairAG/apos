import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { apiBase } from '../api/apiBase';
import {
    persistStore,
    persistReducer,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
//slices
import materialesReducer from '../features/inventario/materiales/materiales.slice';
import categoriaReducer from '../features/producto/categoria/categoria.slice';
import grupoExtraReducer from '../features/producto/grupoExtra/grupoExtra.slice';
import productoReducer from '../features/producto/producto/producto.slice';
import recetaReducer from '../features/producto/receta/receta.slice';
import sucursalReducer from '../features/sucursal/sucursal.slice';
import authReducer from '../features/usuario/auth/auth.slice';
import usuarioReducer from '../features/usuario/usuario/usuario.slice';
import mesaReducer from '../features/mesas/mesa.slice';
import posReducer from '../features/pos/pos.slice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'sucursal','usuario'], // solo persistir estos slices
};

const rootReducer = combineReducers({
    auth: authReducer,
    sucursal: sucursalReducer,
    materiales: materialesReducer,
    recetas: recetaReducer,
    usuario: usuarioReducer,
    productos: productoReducer,
    categorias: categoriaReducer,
    gruposExtra: grupoExtraReducer,
    mesas: mesaReducer,
    pos: posReducer,
});

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

// Inicializar el token de apiBase desde sessionStorage al cargar la aplicación
//apiBase.initializeAuthFromStorage().catch(console.error);

// Suscribirse a cambios de autenticación para sincronizar el token
/*store.subscribe(() => {
    const state = store.getState();
    if (state.auth.token) {
        apiBase.syncTokenFromRedux();
    }
});*/

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;