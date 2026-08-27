package com.api.apos.enums;

public enum TipoMovimiento {
    // Ingresos
    VENTA,
    DEVOLUCION_VENTA,
    INGRESO_EXTRA,

    // Inventario
    GASTO_RESTOCK,

    // Operación diaria
    GASTO_OPERATIVO,

    // Administración
    GASTO_ADMINISTRATIVO,

    // Nómina
    PAGO_EMPLEADO,

    // Servicios
    PAGO_SERVICIO,

    // Activos
    COMPRA_ACTIVO,

    // Caja
    RETIRO_CAJA,
    INGRESO_CAJA
}