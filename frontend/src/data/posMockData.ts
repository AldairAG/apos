// Datos mock para el módulo POS
import { Categoria, Extra, ItemOrden, Mesa, Orden, Producto } from '@/types/pos.types';

export const MOCK_CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Bebidas', icono: 'coffee', color: '#8B4513' },
  { id: 2, nombre: 'Comida', icono: 'restaurant', color: '#FF6B6B' },
  { id: 3, nombre: 'Postres', icono: 'cake', color: '#FFA07A' },
  { id: 4, nombre: 'Entradas', icono: 'appetizer', color: '#4ECDC4' },
  { id: 5, nombre: 'Ensaladas', icono: 'salad', color: '#95E1D3' },
];

export const MOCK_EXTRAS: Extra[] = [
  { id: 1, nombre: 'Extra queso', precio: 15 },
  { id: 2, nombre: 'Tocino', precio: 20 },
  { id: 3, nombre: 'Aguacate', precio: 18 },
  { id: 4, nombre: 'Doble carne', precio: 35 },
  { id: 5, nombre: 'Sin cebolla', precio: 0 },
  { id: 6, nombre: 'Picante', precio: 0 },
];

export const MOCK_PRODUCTOS: Producto[] = [
  // Bebidas
  {
    id: 1,
    nombre: 'Café Americano',
    descripcion: 'Café negro recién hecho',
    precio: 35,
    categoriaId: 1,
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Cappuccino',
    descripcion: 'Café con leche espumosa',
    precio: 45,
    categoriaId: 1,
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Latte',
    descripcion: 'Café con leche',
    precio: 45,
    categoriaId: 1,
    disponible: true,
  },
  {
    id: 4,
    nombre: 'Jugo Natural',
    descripcion: 'Jugo de naranja recién exprimido',
    precio: 40,
    categoriaId: 1,
    disponible: true,
  },
  {
    id: 5,
    nombre: 'Refresco',
    descripcion: 'Refresco de cola',
    precio: 25,
    categoriaId: 1,
    disponible: true,
  },
  
  // Comida
  {
    id: 6,
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Carne, lechuga, tomate, cebolla',
    precio: 120,
    categoriaId: 2,
    disponible: true,
    extras: MOCK_EXTRAS,
  },
  {
    id: 7,
    nombre: 'Pizza Margarita',
    descripcion: 'Salsa de tomate, mozzarella, albahaca',
    precio: 150,
    categoriaId: 2,
    disponible: true,
  },
  {
    id: 8,
    nombre: 'Tacos',
    descripcion: 'Orden de 3 tacos al pastor',
    precio: 85,
    categoriaId: 2,
    disponible: true,
    extras: MOCK_EXTRAS,
  },
  {
    id: 9,
    nombre: 'Sándwich Club',
    descripcion: 'Triple pan con pollo, tocino y vegetales',
    precio: 95,
    categoriaId: 2,
    disponible: true,
  },
  
  // Postres
  {
    id: 10,
    nombre: 'Pastel de Chocolate',
    descripcion: 'Rebanada de pastel con helado',
    precio: 65,
    categoriaId: 3,
    disponible: true,
  },
  {
    id: 11,
    nombre: 'Flan Napolitano',
    descripcion: 'Flan casero con caramelo',
    precio: 50,
    categoriaId: 3,
    disponible: true,
  },
  {
    id: 12,
    nombre: 'Helado',
    descripcion: '3 bolas de helado a elegir',
    precio: 45,
    categoriaId: 3,
    disponible: true,
  },
  
  // Entradas
  {
    id: 13,
    nombre: 'Alitas BBQ',
    descripcion: 'Orden de 10 alitas',
    precio: 110,
    categoriaId: 4,
    disponible: true,
  },
  {
    id: 14,
    nombre: 'Nachos',
    descripcion: 'Con queso, jalapeños y guacamole',
    precio: 85,
    categoriaId: 4,
    disponible: true,
  },
  {
    id: 15,
    nombre: 'Quesadillas',
    descripcion: 'Orden de 3 quesadillas',
    precio: 75,
    categoriaId: 4,
    disponible: true,
  },
  
  // Ensaladas
  {
    id: 16,
    nombre: 'Ensalada César',
    descripcion: 'Lechuga, crutones, parmesano, pollo',
    precio: 95,
    categoriaId: 5,
    disponible: true,
  },
  {
    id: 17,
    nombre: 'Ensalada Mixta',
    descripcion: 'Vegetales frescos con aderezo',
    precio: 75,
    categoriaId: 5,
    disponible: true,
  },
];

export const MOCK_MESAS: Mesa[] = [
  { id: 1, numero: '1', estado: 'ocupada', capacidad: 4, personasActuales: 2, ordenActual: 1, totalAcumulado: 285 },
  { id: 2, numero: '2', estado: 'libre', capacidad: 2 },
  { id: 3, numero: '3', estado: 'ocupada', capacidad: 6, personasActuales: 4, ordenActual: 2, totalAcumulado: 450 },
  { id: 4, numero: '4', estado: 'reservada', capacidad: 4 },
  { id: 5, numero: '5', estado: 'libre', capacidad: 2 },
  { id: 6, numero: '6', estado: 'ocupada', capacidad: 4, personasActuales: 3, ordenActual: 3, totalAcumulado: 195 },
  { id: 7, numero: '7', estado: 'libre', capacidad: 8 },
  { id: 8, numero: '8', estado: 'ocupada', capacidad: 2, personasActuales: 2, ordenActual: 4, totalAcumulado: 120 },
  { id: 9, numero: '9', estado: 'libre', capacidad: 4 },
  { id: 10, numero: '10', estado: 'libre', capacidad: 6 },
  { id: 11, numero: '11', estado: 'ocupada', capacidad: 4, personasActuales: 4, ordenActual: 5, totalAcumulado: 580 },
  { id: 12, numero: '12', estado: 'libre', capacidad: 2 },
];

// Helper para crear items de orden
const crearItemOrden = (productoId: number, cantidad: number, extras: Extra[] = [], notas?: string): ItemOrden => {
  const producto = MOCK_PRODUCTOS.find(p => p.id === productoId)!;
  const precioExtras = extras.reduce((sum, e) => sum + e.precio, 0);
  const subtotal = (producto.precio + precioExtras) * cantidad;
  
  return {
    id: `${productoId}-${Date.now()}-${Math.random()}`,
    productoId,
    producto,
    cantidad,
    precio: producto.precio + precioExtras,
    extras,
    notas,
    subtotal,
  };
};

export const MOCK_ORDENES: Orden[] = [
  {
    id: 1,
    numero: 'ORD-001',
    tipo: 'mesa',
    estado: 'preparando',
    mesaId: 1,
    items: [
      crearItemOrden(6, 2, [MOCK_EXTRAS[0], MOCK_EXTRAS[1]]),
      crearItemOrden(2, 2),
      crearItemOrden(10, 1),
    ],
    subtotal: 285,
    descuentos: [],
    cortesias: [],
    total: 285,
    paraLlevar: false,
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 15,
  },
  {
    id: 2,
    numero: 'ORD-002',
    tipo: 'mesa',
    estado: 'preparando',
    mesaId: 3,
    items: [
      crearItemOrden(7, 2),
      crearItemOrden(13, 1),
      crearItemOrden(4, 4),
    ],
    subtotal: 450,
    descuentos: [],
    cortesias: [],
    total: 450,
    paraLlevar: false,
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 25,
  },
  {
    id: 3,
    numero: 'ORD-003',
    tipo: 'mesa',
    estado: 'lista',
    mesaId: 6,
    items: [
      crearItemOrden(8, 3, [MOCK_EXTRAS[2]]),
      crearItemOrden(5, 2),
    ],
    subtotal: 195,
    descuentos: [],
    cortesias: [],
    total: 195,
    paraLlevar: false,
    createdAt: new Date(Date.now() - 10 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 10,
  },
  {
    id: 4,
    numero: 'ORD-004',
    tipo: 'llevar',
    estado: 'pendiente',
    items: [
      crearItemOrden(9, 2),
      crearItemOrden(1, 2),
    ],
    subtotal: 120,
    descuentos: [],
    cortesias: [],
    total: 120,
    paraLlevar: true,
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 5,
  },
  {
    id: 5,
    numero: 'ORD-005',
    tipo: 'mesa',
    estado: 'preparando',
    mesaId: 11,
    items: [
      crearItemOrden(7, 2),
      crearItemOrden(14, 2),
      crearItemOrden(16, 2),
      crearItemOrden(3, 4),
    ],
    subtotal: 580,
    descuentos: [{ tipo: 'porcentaje', valor: 10, motivo: 'Cliente frecuente' }],
    cortesias: [],
    total: 522,
    paraLlevar: false,
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 30,
  },
  {
    id: 6,
    numero: 'ORD-006',
    tipo: 'llevar',
    estado: 'lista',
    items: [
      crearItemOrden(6, 3, [MOCK_EXTRAS[0], MOCK_EXTRAS[1], MOCK_EXTRAS[3]]),
      crearItemOrden(5, 3),
    ],
    subtotal: 285,
    descuentos: [],
    cortesias: [],
    total: 285,
    paraLlevar: true,
    createdAt: new Date(Date.now() - 8 * 60000),
    updatedAt: new Date(),
    tiempoTranscurrido: 8,
  },
];
