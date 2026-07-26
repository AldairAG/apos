import { Sucursal } from "@/features/sucursal/sucursal.types";
import { MetodoPago } from "@/types/pos.types";

export interface Caja {
    id: number;
    nombre: string;
    activa: boolean;
    estado: EstadoCaja;
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
    restock: RestockDTO|null;
}

export interface RestockDTO {
    materialId: number;
    cantidad: number;
}

export enum TipoMovimientoCaja {
    INGRESO = "INGRESO",
    EGRESO = "EGRESO",
}

export enum TipoConceptoMovimiento {
    // Ingresos
    VENTA = "VENTA",
    DEVOLUCION_VENTA = "DEVOLUCION_VENTA",
    INGRESO_EXTRA = "INGRESO_EXTRA",
    // Inventario
    GASTO_RESTOCK = "GASTO_RESTOCK",
    // Operación diaria
    GASTO_OPERATIVO = "GASTO_OPERATIVO",
    // Administración
    GASTO_ADMINISTRATIVO = "GASTO_ADMINISTRATIVO",
    // Nómina
    PAGO_EMPLEADO = "PAGO_EMPLEADO",
    // Servicios
    PAGO_SERVICIO = "PAGO_SERVICIO",
    // Activos
    COMPRA_ACTIVO = "COMPRA_ACTIVO",
    // Caja
    RETIRO_CAJA = "RETIRO_CAJA",
    INGRESO_CAJA = "INGRESO_CAJA"
}

export enum EstadoCaja {
    ABIERTA = "ABIERTA",
    CERRADA = "CERRADA"
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
    corteActual: Corte;
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