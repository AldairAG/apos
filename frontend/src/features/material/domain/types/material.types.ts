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

export enum TipoUnidadMedida {
    MASA = "MASA",
    VOLUMEN = "VOLUMEN",
    PIEZA = "PIEZA",
}

// Agrupación por tipo, alineada con el enum equivalente en el backend (UnidadMedida.java)
export const UNIDAD_TIPO: Record<UnidadMedida, TipoUnidadMedida> = {
    [UnidadMedida.GR]: TipoUnidadMedida.MASA,
    [UnidadMedida.KG]: TipoUnidadMedida.MASA,
    [UnidadMedida.MG]: TipoUnidadMedida.MASA,
    [UnidadMedida.LB]: TipoUnidadMedida.MASA,
    [UnidadMedida.ML]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.LT]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.OZ]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.GAL]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.CUP]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.TBSP]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.TSP]: TipoUnidadMedida.VOLUMEN,
    [UnidadMedida.PZ]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.UNIDAD]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.USO]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.POR]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.REBANADA]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.PAQUETE]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.BARRA]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.RAMO]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.LATA]: TipoUnidadMedida.PIEZA,
    [UnidadMedida.BOLSA]: TipoUnidadMedida.PIEZA,
};

export const UNIDAD_MEDIDA_LABELS: Record<UnidadMedida, string> = {
    [UnidadMedida.GR]: "Gramos (g)",
    [UnidadMedida.KG]: "Kilogramos (kg)",
    [UnidadMedida.MG]: "Miligramos (mg)",
    [UnidadMedida.LB]: "Libras (lb)",
    [UnidadMedida.ML]: "Mililitros (ml)",
    [UnidadMedida.LT]: "Litros (l)",
    [UnidadMedida.OZ]: "Onzas (oz)",
    [UnidadMedida.GAL]: "Galones (gal)",
    [UnidadMedida.CUP]: "Tazas",
    [UnidadMedida.TBSP]: "Cucharadas",
    [UnidadMedida.TSP]: "Cucharaditas",
    [UnidadMedida.PZ]: "Piezas (pz)",
    [UnidadMedida.UNIDAD]: "Unidad",
    [UnidadMedida.USO]: "Uso",
    [UnidadMedida.POR]: "Porción",
    [UnidadMedida.REBANADA]: "Rebanada",
    [UnidadMedida.PAQUETE]: "Paquete",
    [UnidadMedida.BARRA]: "Barra",
    [UnidadMedida.RAMO]: "Ramo",
    [UnidadMedida.LATA]: "Lata",
    [UnidadMedida.BOLSA]: "Bolsa",
};

export const TIPO_UNIDAD_LABELS: Record<TipoUnidadMedida, string> = {
    [TipoUnidadMedida.MASA]: "Masa",
    [TipoUnidadMedida.VOLUMEN]: "Volumen",
    [TipoUnidadMedida.PIEZA]: "Pieza",
};

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
