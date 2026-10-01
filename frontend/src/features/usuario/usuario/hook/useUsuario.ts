import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { obtenerUsuarioActual } from "../aplication/query/ObtenerUsuarioActual.thunk";
import { desactivarUsuarioActualThunk } from "../aplication/usecase/DesactivarUsuarioActualThunk";
import { clearUsuario, setUsuario } from "../store/usuario.slice";

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

    const desactivarUsuarioActual = useCallback(async () => {
        await dispatch(desactivarUsuarioActualThunk()).unwrap();
    }, [dispatch]);

    return {
        usuario: usuarioData,
        loading,
        error,
        setUsuario: handleSetUsuario,
        clearUsuario: handleClearUsuario,
        obtenerUsuarioActual: handleObtenerUsuarioActual,
        desactivarUsuarioActual,
    }
}