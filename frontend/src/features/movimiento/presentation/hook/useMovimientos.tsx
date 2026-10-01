import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findByDateQueryThunk } from "../../aplication/query/FindByDateQueryThunk";
import { crearCompraThunk } from "../../aplication/usecase/CrearCompraThunk";
import { crearEgresoThunk } from "../../aplication/usecase/CrearEgresoThunk";
import { crearIngresoThunk } from "../../aplication/usecase/CrearIngresoThunk";
import type { RegistrarCompraDto } from "../../domain/types/Movimiento.types";

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

    const crearCompra = (movimientoDto: RegistrarCompraDto) =>
        dispatch(crearCompraThunk(movimientoDto)).unwrap();

    const findByDate = (fecha: string) => {
        dispatch(findByDateQueryThunk({ fecha }));
    };

    return {
        movimientos,
        loading,
        error,
        crearIngreso,
        crearEgreso,
        crearCompra,
        findByDate,
        dispatch,
    };
};