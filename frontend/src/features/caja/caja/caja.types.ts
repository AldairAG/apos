import { Sucursal } from "@/features/sucursal/sucursal.types";
import { MetodoPago } from "@/types/pos.types";

export interface Caja {
    id: number;
    nombre: string;
    activa: boolean;
    movimientos: MovimientoCaja[];
}

export interface MovimientoCaja {
    id: number;
    tipoMovimiento: TipoMovimientoCaja;
    conceptoMovimiento: TipoConceptoMovimiento;
    metodoPago: MetodoPago;
    concepto: string;
    referencia: string;
    monto: number;
    aprobado: boolean;
    fecha: string;
    createdAt: string;
    createdBy: number;
    cajaId: number;
    empleadoId: number;
    ordenId: number;
}

export enum TipoMovimientoCaja {
    INGRESO = "INGRESO",
    EGRESO = "EGRESO",
}

export enum TipoConceptoMovimiento {
    VENTA = "VENTA",
    GASTO = "GASTO",
    APERTURA = "APERTURA",
    CIERRE = "CIERRE",
    OTRO = "OTRO",
}


export interface CrearCajaRequest {
    nombre: string;
    activa: boolean;
    sucursalId: number;
}

export interface CajaState {
    cajas: Caja[];
    cajaSeleccionada: Caja | null;
    MovimientosCaja: MovimientoCaja[];
    corteActual: Corte | null;
    loading: boolean;
    error: string | null;
}

export interface Corte {
    id: number;
    fechaInicio: string;
    fechaFin: string;
    montoInicial: number;
    montoFinal: number;
    efectivoCalculado: number;
    efectivoReal: number;
    diferencia: number;
    tarjetas: number;
    transferencias: number;
    totalVentas: number;
    totalGastos: number;
    numeroOrdenes: number;
    observaciones: string;
    cerrado: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
}