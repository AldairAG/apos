import type { ProductoDto } from "@/features/productos/domain/types/producto.types";

export type EstadoOrden =
    | "PENDIENTE"
    | "EN_PREPARACION"
    | "LISTA"
    | "ENTREGADA"
    | "CANCELADA"
    | "COBRADA";

export type MetodoPago =
    | "EFECTIVO"
    | "DIGITAL"
    | "TARJETA_DEBITO"
    | "TARJETA_CREDITO"
    | "TRANSFERENCIA_BANCARIA"
    | "MIXTO"
    | "GRATIS";

export interface PosOpcionDto {
    id?: number;
    nombre?: string;
    precio: number;
    cantidad?: number;
}

export interface DetalleOrdenDto {
    id?: number;
    producto?: ProductoDto;
    cantidad: number;
    precioUnitario?: number;
    subtotal?: number;
    notas?: string;
    modificadores: PosOpcionDto[];
    productoId?: number;
}

export interface OrdenDto {
    id?: number;
    estado?: EstadoOrden;
    subtotal?: number;
    descuento?: number;
    total: number;
    createdAt?: string;
    sucursalId: number;
    mesaId?: number | null;
    mesaNombre?: string;
    ventaId?: number;
    detalles: DetalleOrdenDto[];
}

export interface CategoriaProductoDto {
    categoria: string;
    productos: ProductoDto[];
}

export interface MovimientoPagoDto {
    descripcion: string;
    monto: number;
    metodoDePago: MetodoPago;
}

export interface PagarVentaDto {
    ordenId: number;
    movimientos: MovimientoPagoDto[];
    cajaId: number;
    corteCajaId: number;
}

export const POS_API_BASE_PATH = "/pos";