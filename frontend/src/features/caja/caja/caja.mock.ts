// Datos mock para el módulo de Caja
// IMPORTANTE: Esta información es completamente simulada (mock) y local.
// No hay llamadas a API ni a Redux aquí. Cuando se conecte el backend,
// estas funciones/constantes deben sustituirse por thunks/selectores reales,
// manteniendo la misma forma de datos (Caja, MovimientoCaja).
import {
  Caja,
  MovimientoCaja,
  TipoConceptoMovimiento,
  TipoMovimientoCaja,
} from './caja.types';
import { MetodoPago } from '@/types/pos.types';

// ─────────────────────────────────────────────
// Usuarios (solo para mostrar nombre en tarjetas/detalle)
// ─────────────────────────────────────────────
export const MOCK_USUARIOS: Record<number, string> = {
  1: 'Ana Torres',
  2: 'Luis Ramírez',
  3: 'Carla Mendoza',
  4: 'Jorge Ibarra',
};

// ─────────────────────────────────────────────
// Cajas disponibles
// ─────────────────────────────────────────────
export const MOCK_CAJAS: Caja[] = [
  { id: 1, nombre: 'Caja Principal', activa: true, movimientos: [] },
  { id: 2, nombre: 'Caja Barra', activa: false, movimientos: [] },
  { id: 3, nombre: 'Caja Terraza', activa: false, movimientos: [] },
];

// Saldo con el que se aperturó cada caja (monto inicial)
export const MOCK_SALDO_INICIAL: Record<number, number> = {
  1: 1500,
  2: 800,
  3: 500,
};

// ─────────────────────────────────────────────
// Movimientos de caja
// La "categoría" de cada movimiento se representa con el campo `concepto`
// (texto libre definido en caja.types), tal como pide el ejemplo:
// Hielo, Salarios, Ventas, etc.
// ─────────────────────────────────────────────
const hoy = new Date();

function horaDeHoy(hora: number, minuto: number): string {
  const fecha = new Date(hoy);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha.toISOString();
}

export const MOCK_MOVIMIENTOS: MovimientoCaja[] = [
  {
    id: 1,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.APERTURA,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Apertura',
    referencia: 'Fondo inicial de caja',
    monto: 1500,
    aprobado: true,
    fecha: horaDeHoy(8, 0),
    createdAt: horaDeHoy(8, 0),
    createdBy: 1,
    cajaId: 1,
    empleadoId: 1,
    ordenId: 0,
  },
  {
    id: 2,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.VENTA,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Ventas',
    referencia: 'Orden #1042 - Mesa 5',
    monto: 480,
    aprobado: true,
    fecha: horaDeHoy(9, 15),
    createdAt: horaDeHoy(9, 15),
    createdBy: 2,
    cajaId: 1,
    empleadoId: 2,
    ordenId: 1042,
  },
  {
    id: 3,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.VENTA,
    metodoPago: 'tarjeta' as MetodoPago,
    concepto: 'Ventas',
    referencia: 'Orden #1043 - Para llevar',
    monto: 320,
    aprobado: true,
    fecha: horaDeHoy(10, 40),
    createdAt: horaDeHoy(10, 40),
    createdBy: 2,
    cajaId: 1,
    empleadoId: 3,
    ordenId: 1043,
  },
  {
    id: 4,
    tipoMovimiento: TipoMovimientoCaja.EGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.GASTO,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Hielo',
    referencia: 'Compra de 3 bolsas de hielo',
    monto: 90,
    aprobado: true,
    fecha: horaDeHoy(11, 5),
    createdAt: horaDeHoy(11, 5),
    createdBy: 1,
    cajaId: 1,
    empleadoId: 1,
    ordenId: 0,
  },
  {
    id: 5,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.VENTA,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Ventas',
    referencia: 'Orden #1044 - Mesa 2',
    monto: 610,
    aprobado: true,
    fecha: horaDeHoy(12, 30),
    createdAt: horaDeHoy(12, 30),
    createdBy: 3,
    cajaId: 1,
    empleadoId: 2,
    ordenId: 1044,
  },
  {
    id: 6,
    tipoMovimiento: TipoMovimientoCaja.EGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.GASTO,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Salarios',
    referencia: 'Adelanto de sueldo - Ayudante de cocina',
    monto: 400,
    aprobado: true,
    fecha: horaDeHoy(13, 10),
    createdAt: horaDeHoy(13, 10),
    createdBy: 1,
    cajaId: 1,
    empleadoId: 4,
    ordenId: 0,
  },
  {
    id: 7,
    tipoMovimiento: TipoMovimientoCaja.EGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.GASTO,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Insumos',
    referencia: 'Compra de servilletas y desechables',
    monto: 65,
    aprobado: false,
    fecha: horaDeHoy(14, 20),
    createdAt: horaDeHoy(14, 20),
    createdBy: 4,
    cajaId: 1,
    empleadoId: 4,
    ordenId: 0,
  },
  {
    id: 8,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.VENTA,
    metodoPago: 'transferencia' as MetodoPago,
    concepto: 'Ventas',
    referencia: 'Orden #1045 - Mesa 8',
    monto: 275,
    aprobado: true,
    fecha: horaDeHoy(15, 5),
    createdAt: horaDeHoy(15, 5),
    createdBy: 3,
    cajaId: 1,
    empleadoId: 3,
    ordenId: 1045,
  },
  {
    id: 9,
    tipoMovimiento: TipoMovimientoCaja.EGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.GASTO,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Renta',
    referencia: 'Pago proporcional de renta del día',
    monto: 150,
    aprobado: true,
    fecha: horaDeHoy(16, 0),
    createdAt: horaDeHoy(16, 0),
    createdBy: 1,
    cajaId: 1,
    empleadoId: 1,
    ordenId: 0,
  },
  // Movimiento de un día anterior, no debe aparecer en la lista de "hoy"
  {
    id: 10,
    tipoMovimiento: TipoMovimientoCaja.INGRESO,
    conceptoMovimiento: TipoConceptoMovimiento.VENTA,
    metodoPago: 'efectivo' as MetodoPago,
    concepto: 'Ventas',
    referencia: 'Orden #999 - Mesa 1',
    monto: 350,
    aprobado: true,
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1, 18, 0).toISOString(),
    createdAt: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1, 18, 0).toISOString(),
    createdBy: 2,
    cajaId: 1,
    empleadoId: 2,
    ordenId: 999,
  },
];

// ─────────────────────────────────────────────
// Colores para las categorías de la gráfica de pastel
// ─────────────────────────────────────────────
const COLORES_CATEGORIA = [
  '#007AFF',
  '#28A745',
  '#FFC107',
  '#DC3545',
  '#17A2B8',
  '#6F42C1',
  '#FD7E14',
  '#20C997',
];

export interface DistribucionCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
  color: string;
}

export interface ResumenCaja {
  saldoActual: number;
  totalIngresos: number;
  totalGastos: number;
  totalMovimientos: number;
}

/** Devuelve solo los movimientos del día actual para una caja, más recientes primero. */
export function getMovimientosDeHoy(
  movimientos: MovimientoCaja[],
  cajaId: number
): MovimientoCaja[] {
  const ahora = new Date();
  return movimientos
    .filter((m) => {
      if (m.cajaId !== cajaId) return false;
      const fecha = new Date(m.fecha);
      return (
        fecha.getDate() === ahora.getDate() &&
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

/** Calcula el resumen (saldo, ingresos, gastos, total de movimientos) del día. */
export function calcularResumen(
  movimientosDelDia: MovimientoCaja[],
  saldoInicial: number
): ResumenCaja {
  const totalIngresos = movimientosDelDia
    .filter((m) => m.tipoMovimiento === TipoMovimientoCaja.INGRESO)
    .reduce((sum, m) => sum + m.monto, 0);

  const totalGastos = movimientosDelDia
    .filter((m) => m.tipoMovimiento === TipoMovimientoCaja.EGRESO)
    .reduce((sum, m) => sum + m.monto, 0);

  return {
    saldoActual: saldoInicial + totalIngresos - totalGastos,
    totalIngresos,
    totalGastos,
    totalMovimientos: movimientosDelDia.length,
  };
}

/** Agrupa los movimientos de un tipo (ingreso/gasto) por categoría (`concepto`) con su porcentaje. */
export function calcularDistribucionPorCategoria(
  movimientosDelDia: MovimientoCaja[],
  tipo: TipoMovimientoCaja
): DistribucionCategoria[] {
  const filtrados = movimientosDelDia.filter((m) => m.tipoMovimiento === tipo);
  const total = filtrados.reduce((sum, m) => sum + m.monto, 0);

  const porCategoria = new Map<string, number>();
  filtrados.forEach((m) => {
    porCategoria.set(m.concepto, (porCategoria.get(m.concepto) ?? 0) + m.monto);
  });

  return Array.from(porCategoria.entries())
    .map(([categoria, monto], index) => ({
      categoria,
      monto,
      porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
      color: COLORES_CATEGORIA[index % COLORES_CATEGORIA.length],
    }))
    .sort((a, b) => b.monto - a.monto);
}

// ─────────────────────────────────────────────
// Denominaciones de efectivo para la calculadora del corte
// ─────────────────────────────────────────────
export const BILLETES = [1000, 500, 200, 100, 50, 20] as const;
export const MONEDAS = [20, 10, 5, 2, 1, 0.5] as const;
