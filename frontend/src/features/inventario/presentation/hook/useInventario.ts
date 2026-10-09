import { findMaterialesThunk } from "@/features/material/aplication/query/FindMaterialesThunk";
import { findRecetasThunk } from "@/features/receta/aplication/query/FindRecetasThunk";
import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { obtenerInventarioThunk } from "../../aplication/query/ObtenerInventarioThunk";
import { obtenerMovimientosThunk } from "../../aplication/query/ObtenerMovimientosThunk";
import { producirMaterialThunk } from "../../aplication/usecase/ProducirMaterialThunk";
import { registrarMovimientoThunk } from "../../aplication/usecase/RegistrarMovimientoThunk";
import type {
    ExistenciaDto,
    ProducirMaterialDto,
    RegistrarMovimientoInventarioDto,
    TipoOperacionInventario,
} from "../../domain/types/inventario.types";
import { editarExistenciaMinimaThunk } from "../../aplication/usecase/EditarExistenciaMinima";

export const useInventario = () => {
    const dispatch = useDispatch<AppDispatch>();
    const inventario = useSelector((state: RootState) => state.inventario);
    const materiales = useSelector((state: RootState) => state.material.materiales);
    const recetas = useSelector((state: RootState) => state.receta.recetas);

    const cargarInventario = useCallback((sucursalId: number, page = 0, size = 100) => {
        dispatch(obtenerInventarioThunk({ sucursalId, page, size }));
    }, [dispatch]);

    const cargarMovimientos = useCallback((sucursalId: number, page = 0) => {
        dispatch(obtenerMovimientosThunk({ sucursalId, page }));
    }, [dispatch]);

    const cargarCatalogos = useCallback(() => {
        dispatch(findMaterialesThunk({ size: 100 }));
        dispatch(findRecetasThunk({ size: 100 }));
    }, [dispatch]);

    const actualizarConsultas = useCallback((sucursalId: number) => {
        dispatch(obtenerInventarioThunk({ sucursalId }));
        dispatch(obtenerMovimientosThunk({ sucursalId }));
    }, [dispatch]);

    const registrarMovimiento = useCallback(async (
        tipo: TipoOperacionInventario,
        request: RegistrarMovimientoInventarioDto
    ) => {
        const response = await dispatch(registrarMovimientoThunk({ tipo, request })).unwrap();
        actualizarConsultas(request.sucursalId);
        return response.data;
    }, [actualizarConsultas, dispatch]);

    const producirMaterial = useCallback(async (request: ProducirMaterialDto) => {
        const response = await dispatch(producirMaterialThunk(request)).unwrap();
        actualizarConsultas(request.sucursalId);
        return response.data;
    }, [actualizarConsultas, dispatch]);

    const editarExistenciaMinima = useCallback(async (existencia: ExistenciaDto) => {
        const response = await dispatch(editarExistenciaMinimaThunk(existencia)).unwrap();
        actualizarConsultas(existencia.sucursalId);
        return response.data;
    }, [actualizarConsultas, dispatch]);

    return {
        ...inventario,
        materiales,
        recetasMaterial: recetas.filter((receta) => receta.tipoResultado === "MATERIAL"),
        cargarInventario,
        cargarMovimientos,
        cargarCatalogos,
        registrarMovimiento,
        producirMaterial,
        editarExistenciaMinima,
    };
};