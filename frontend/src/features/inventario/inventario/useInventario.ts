import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setMaterialSeleccionado } from "./inventario.slice";
import { MaterialDTO } from "./inventario.types";
import { useCallback } from "react";
import { fetchInventarioBySucursal } from "./inventario.thunk";
import { useSucursal } from "@/features/sucursal/useSucursal";

const useInventario = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { materiales, materialSeleccionado, loading, error } = useSelector(
        (state: RootState) => state.inventario
    );
    const { sucursalActual } = useSucursal();


    const seleccionarMaterial = useCallback((material: MaterialDTO | null) => {
        dispatch(setMaterialSeleccionado(material));
    }, [dispatch]);

    const fetchMaterialesBySucursal = useCallback(() => {
        dispatch(fetchInventarioBySucursal(sucursalActual?.id ?? 1)); // Sucursal ID 1 (ejemplo)
    }, [dispatch, sucursalActual?.id]);

    return {
        materiales,
        materialSeleccionado,
        loading,
        error,
        seleccionarMaterial,
        fetchMaterialesBySucursal,
    };
};

export default useInventario;
