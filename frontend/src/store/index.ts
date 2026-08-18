import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
    persistReducer,
    persistStore,
} from 'redux-persist';
import { apiBase } from '../api/apiBase';
//slices
import authReducer from '../features/usuario/auth/store/auth.slice';
import usuarioReducer from '../features/usuario/usuario/store/usuario.slice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth','usuario'], // solo persistir estos slices
};

const rootReducer = combineReducers({
    auth: authReducer,
    usuario: usuarioReducer,
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

apiBase.setStore(store);

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