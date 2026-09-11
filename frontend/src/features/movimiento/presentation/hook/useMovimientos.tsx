import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { crearEgresoThunk } from "../../aplication/usecase/CrearEgreso";
import { crearIngresoThunk } from "../../aplication/usecase/CrearIngreso";

export const useMovimientos = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Seleccionar estado con tipado correcto
    const movimiento = useSelector((state: RootState) => state.movimiento);
    const { movimientos, loading, error } = movimiento;

    const crearIngreso = (movimientoDto: any) => {
        dispatch(crearIngresoThunk(movimientoDto));
    };

    const crearEgreso = (movimientoDto: any) => {
        dispatch(crearEgresoThunk(movimientoDto));
    };

    return {
        movimientos,
        loading,
        error,
        crearIngreso,
        crearEgreso,
        dispatch,
    };
};