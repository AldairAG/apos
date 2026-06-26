// Tipos para el módulo POS

export type EstadoMesa = 'libre' | 'ocupada' | 'reservada';
export type EstadoOrden = 'pendiente' | 'preparando' | 'lista' | 'cobrada' | 'cancelada';
export type TipoOrden = 'mesa' | 'llevar' | 'rapida';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'multiple';

export interface Mesa {
  id: number;
  nombre: string;
  estado: EstadoMesa;
  capacidad: number;
  personasActuales?: number;
  ordenActual?: number;
  totalAcumulado?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

export interface Extra {
  id: number;
  nombre: string;
  precio: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: number;
  imagen?: string;
  disponible: boolean;
  extras?: Extra[];
}

export interface ItemOrden {
  id: string;
  productoId: number;
  producto: Producto;
  cantidad: number;
  precio: number;
  extras: Extra[];
  notas?: string;
  subtotal: number;
}

export interface Descuento {
  tipo: 'porcentaje' | 'monto';
  valor: number;
  motivo: string;
}

export interface Cortesia {
  itemId: string;
  motivo: string;
  autorizadoPor?: string;
}

export interface DivisionCuenta {
  tipo: 'items' | 'personas' | 'porcentaje';
  divisiones: {
    id: string;
    items?: string[];
    porcentaje?: number;
    monto?: number;
  }[];
}

export interface Orden {
  id: number;
  numero: string;
  tipo: TipoOrden;
  estado: EstadoOrden;
  mesaId?: number;
  items: ItemOrden[];
  subtotal: number;
  descuentos: Descuento[];
  cortesias: Cortesia[];
  total: number;
  notas?: string;
  paraLlevar: boolean;
  createdAt: Date;
  updatedAt: Date;
  tiempoTranscurrido?: number;
}

export interface Pago {
  metodo: MetodoPago;
  monto: number;
  referencia?: string;
}
