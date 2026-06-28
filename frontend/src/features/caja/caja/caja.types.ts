import { Sucursal } from "@/features/sucursal/sucursal.types";

export interface Caja {
    id: number;
    nombre: string;
    activa: boolean;
    createdAt: string;
    updatedAt: string;
    sucursal: Sucursal;
    movimientos: MovimientoCaja[];
}

export interface MovimientoCaja {
    id: number;
    tipo: TipoMovimientoCaja;
}

export enum TipoMovimientoCaja {
    INGRESO = "INGRESO",
    TRANSFERENCIA = "TRANSFERENCIA",
    EGRESO = "EGRESO",
}

export enum TipoMetodoPago {
    TARJETA="TARJETA",
    EFECTIVO="EFECTIVO",
    VALE="VALE",
    GRATIS="GRATIS",
}