export enum Unidad {
    ML= "ML",
    GR= "GR",
    PZ= "PZ",
    LT= "LT",
    OZ= "OZ",
    KG= "KG",
    LB= "LB",
    UNIDAD= "UNIDAD",
    USO= "USO"
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}