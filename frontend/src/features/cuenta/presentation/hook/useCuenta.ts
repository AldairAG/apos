import { removerCuenta } from "@/features/usuario/usuario/store/usuario.slice";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { desactivarCuentaThunk } from "../../aplication/usecase/DesactivarCuentaThunk";

export const useCuenta = () => {
    const dispatch = useDispatch<AppDispatch>();

    const desactivarCuenta = async (cuentaId: number) => {
        await dispatch(desactivarCuentaThunk(cuentaId)).unwrap();
        dispatch(removerCuenta(cuentaId));
    };

    return { desactivarCuenta };
};