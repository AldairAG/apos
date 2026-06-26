import { Categoria, Mesa } from "@/types/pos.types";
import { OpcionExtra, ProductoGrupoExtra } from "../producto/producto/producto.types";

export interface OrdenResponseDTO {
    id: number;
    folio: string;
    tipo: string;
    estado: string;
    numeroPersonas: number;
    tiempoPreparacion: number;
    observaciones: string;
    subtotal: number;
    descuento: number;
    propina: number;
    total: number;
    fecha: Date;
    horaEntrega: Date;
    createdAt: Date;
    mesa: Mesa;
    detalles: DetalleOrden[];
}

export interface ProductosBySucursalResponse {
    id: number;
    nombre: string;
    descripcion: string;
    precioVenta: number;
    tiempoPreparacion: number;
    activo: boolean;
    disponible: boolean;
    destacado: boolean;
    categoria: Categoria;
    gruposExtra: ProductoGrupoExtra[];
}

export interface CrearOrdenDTO {
    id: number;
    tipo: string;
    numeroPersonas: number;
    observaciones: string;
    nombreCliente: string;
    telefonoCliente: string;
    subtotal: number;
    descuento: number;
    total: number;
    sucursalId: number;
    mesaId: number;
    detallesDTO: DetalleOrdenDTO[];
}

export interface DetalleOrdenDTO {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    extras: DetalleOrdenExtraDTO[];
}


export interface DetalleOrdenExtraDTO {
    opcionExtraId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface DetalleOrden {
    id: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    createdAt: Date;
    updatedAt: Date;
    ordenId: number;
    productoId: number;
    extras: DetalleOrdenExtra[];
}

export interface DetalleOrdenExtra {
    id: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    createdAt: Date;
    updatedAt: Date;
    opcionExtra: OpcionExtra;
}
export enum TipoOrden {
    EN_MESA= "EN_MESA",
    PARA_LLEVAR= "PARA_LLEVAR",
    DELIVERY= "DELIVERY",
    RECOGER= "RECOGER"
}

export enum EstadoOrden {
    PENDIENTE= "PENDIENTE",
    EN_PREPARACION= "EN_PREPARACION",
    LISTA= "LISTA",
    ENTREGADA= "ENTREGADA",
    CANCELADA= "CANCELADA"
}

