import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import {setUsuario} from "./usuario.slice";

export const useUsuario = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Seleccionar estado con tipado correcto
    const usuario = useSelector((state: RootState) => state.usuario);
    const { usuario: usuarioData, loading, error } = usuario;

    const handleSetUsuario = (usuario: any) => {
        dispatch(setUsuario(usuario));
    }

    return {
        usuario: usuarioData,
        loading,
        error,
        setUsuario: handleSetUsuario,
    }
}