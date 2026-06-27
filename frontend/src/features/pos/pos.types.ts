import { Categoria, Mesa } from "@/types/pos.types";
import { EstadoMesa } from "../mesas/mesas.types";
import { OpcionExtra } from "../producto/producto/producto.types";

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
    detalles: DetalleOrdenResponseDTO[];
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
    gruposExtra: ProductoGrupoExtraResponse[];
}

export interface ProductoGrupoExtraResponse {
    id: number;
    minimo: number;
    maximo: number;
    obligatorio: boolean;
    grupoExtra: GrupoExtraResponse;
}

export interface GrupoExtraResponse {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    opciones: OpcionExtraResponse[];
}

export interface OpcionExtraResponse {
    id: number;
    nombre: string;
    precio: number;
    activo: boolean;
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

export interface MesaPosResponseDTO {
    id: number;
    
    nombre: string;
    codigo: string;
    
    estado: EstadoMesa;
    
    activa: boolean;
    ordenActual: number;
    
    ordenActualDTO: OrdenResponseDTO;
}

    export interface DetalleOrdenResponseDTO {
        id: number;
        nombreProducto: string;
        cantidad: number;
        precioUnitario: number;
        total: number;
        extras: DetalleOrdenExtraResponseDTO[];

    }

    export interface DetalleOrdenExtraResponseDTO {
        id: number;
        nombreExtra: string;
        precioExtra: number;
        opcionId: number;
        cantidad: number;
        total: number;
    }