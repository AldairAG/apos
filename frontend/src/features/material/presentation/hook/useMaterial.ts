import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { FindMaterialesParams, findMaterialesThunk } from "../../aplication/query/FindMaterialesThunk";
import { crearMaterialThunk } from "../../aplication/usecase/CrearMaterialThunk";
import { MaterialDto } from "../../domain/types/material.types";

export const useMaterial = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { materiales, pageInfo, loading, error } = useSelector(
        (state: RootState) => state.material
    );

    const findMateriales = (params?: FindMaterialesParams) => {
        dispatch(findMaterialesThunk(params));
    };

    const crearMaterial = (material: MaterialDto) => {
        dispatch(crearMaterialThunk(material));
    };

    return {
        materiales,
        pageInfo,
        loading,
        error,
        findMateriales,
        crearMaterial,
    };
};
