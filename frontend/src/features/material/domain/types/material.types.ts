export enum UnidadMedida {
    GR = "GR",
    KG = "KG",
    MG = "MG",
    LB = "LB",
    ML = "ML",
    LT = "LT",
    OZ = "OZ",
    GAL = "GAL",
    CUP = "CUP",
    TBSP = "TBSP",
    TSP = "TSP",
    PZ = "PZ",
    UNIDAD = "UNIDAD",
    USO = "USO",
    POR = "POR",
    REBANADA = "REBANADA",
    PAQUETE = "PAQUETE",
    BARRA = "BARRA",
    RAMO = "RAMO",
    LATA = "LATA",
    BOLSA = "BOLSA",
}

export interface MaterialDto {
    id?: number;
    nombre: string;
    proveedor?: string;
    unidad: UnidadMedida;
    cantidad: number;
    precio: number;
    descripcion?: string;
}

export const API_BASE_PATH = "/materiales";
