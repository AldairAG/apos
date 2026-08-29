import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {setUsuario, clearUsuario} from "../store/usuario.slice";
import { obtenerUsuarioActual } from "../aplication/query/ObtenerUsuarioActual.thunk";

export const useUsuario = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Seleccionar estado con tipado correcto
    const usuario = useSelector((state: RootState) => state.usuario);
    const { usuario: usuarioData, loading, error } = usuario;

    const handleSetUsuario = (usuario: any) => {
        dispatch(setUsuario(usuario));
    }

    const handleClearUsuario = () => {
        dispatch(clearUsuario());
    }

    const handleObtenerUsuarioActual = useCallback(async () => {
        const result = await dispatch(obtenerUsuarioActual()).unwrap();
        return result;
    }, [dispatch]);

    return {
        usuario: usuarioData,
        loading,
        error,
        setUsuario: handleSetUsuario,
        clearUsuario: handleClearUsuario,
        obtenerUsuarioActual: handleObtenerUsuarioActual,
    }
}