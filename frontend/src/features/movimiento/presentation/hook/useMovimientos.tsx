import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { crearEgresoThunk } from "../../aplication/usecase/CrearEgresoThunk";
import { crearIngresoThunk } from "../../aplication/usecase/CrearIngresoThunk";
import { findByDateQueryThunk } from "../../aplication/query/FindByDateQueryThunk";

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

    const findByDate = (fecha: string) => {
        dispatch(findByDateQueryThunk({ fecha }));
    };

    return {
        movimientos,
        loading,
        error,
        crearIngreso,
        crearEgreso,
        findByDate,
        dispatch,
    };
};