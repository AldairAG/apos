import { Material } from "@/features/inventario/materiales";

export interface Receta {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    instrucciones: string;
    imagen: string;
    rendimiento: number;
    unidadRendimiento: string;
    costoTotal: number;
    tiempoPreparacion: number;
    activa: boolean;
    fechaCreacion: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    updatedBy: number;

    detalles: DetalleReceta[];
}

export interface DetalleReceta {
    id: number;
    cantidad: number;
    unidadMedida: string;
    merma: number;
    material: Material;
}
