import { AppDispatch } from "@/store";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import cocinaSocket from "./cocina.socket";
import { agregarOrden } from "../pos/pos.slice";
import { fetchOrdenesBySucursalThunk } from "../pos/pos.thunks";
import { useSucursal } from "../sucursal/useSucursal";

export const useCocina = () => {
    const { sucursalActual } = useSucursal();
    if (!sucursalActual) throw new Error("Sucursal actual no definida");
    const dispatch = useDispatch<AppDispatch>();

    const cargarOrdenes = useCallback(() => {
        dispatch(fetchOrdenesBySucursalThunk(sucursalActual.id));

        cocinaSocket.conectar(
            sucursalActual.id,
            (orden) => { dispatch(agregarOrden(orden)); }
        );

        return () => {
            cocinaSocket.desconectar();
        };

    }, [sucursalActual.id, dispatch]);

    return {
        cargarOrdenes
    };
};