import { ROUTES } from "@/routes/routes";

// Helper para no repetir el shape en cada navegación:
export function rutaCrearGasto(modulo?: string) {
  return {
    pathname: ROUTES.ADMIN.MOVIMIENTOS.CREAR_GASTO,
    params: modulo ? { modulo } : {},
  } as const;
}

export function rutaCrearIngreso(modulo?: string) {
  return {
    pathname: ROUTES.ADMIN.MOVIMIENTOS.CREAR_INGRESO,
    params: modulo ? { modulo } : {},
  } as const;
}