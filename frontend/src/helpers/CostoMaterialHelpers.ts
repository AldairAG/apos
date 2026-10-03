import { MaterialDto, UnidadMedida } from "@/features/material/domain/types/material.types";

const FACTORES_UNIDAD: Partial<Record<UnidadMedida, number>> = {
    [UnidadMedida.MG]: 0.001,
    [UnidadMedida.GR]: 1,
    [UnidadMedida.KG]: 1000,
    [UnidadMedida.LB]: 453.59237,
    [UnidadMedida.ML]: 1,
    [UnidadMedida.LT]: 1000,
    [UnidadMedida.OZ]: 29.5735,
    [UnidadMedida.GAL]: 3785.411784,
};

export function calcularCostoMaterial(
    cantidadUsada: number,
    unidadUsada: UnidadMedida,
    material: MaterialDto | undefined
): number {
    if (!material || cantidadUsada <= 0 || material.cantidad <= 0) return 0;

    const factorUsado = FACTORES_UNIDAD[unidadUsada];
    const factorMaterial = FACTORES_UNIDAD[material.unidad];
    if (factorUsado === undefined || factorMaterial === undefined) {
        return unidadUsada === material.unidad
            ? (cantidadUsada / material.cantidad) * material.precio
            : 0;
    }

    const cantidadEnUnidadDelMaterial = (cantidadUsada * factorUsado) / factorMaterial;
    return (cantidadEnUnidadDelMaterial / material.cantidad) * material.precio;
}
