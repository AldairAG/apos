package com.api.apos.domain.inventario.service;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.inventario.entity.ExistenciaMaterial;

public interface InventarioService {
    // Consultas
    ExistenciaMaterial obtenerPorId(Long id);

    ExistenciaMaterial obtenerExistencia(Long sucursalId,Long materialId);

    List<ExistenciaMaterial> obtenerInventarioSucursal(Long sucursalId);

    List<ExistenciaMaterial> obtenerStockBajo(Long sucursalId);

    // Movimientos
    ExistenciaMaterial agregarStock(Long sucursalId,Long materialId,BigDecimal cantidad);

    ExistenciaMaterial descontarStock(Long sucursalId,Long materialId,BigDecimal cantidad);

    ExistenciaMaterial ajustarStock(Long sucursalId,Long materialId,BigDecimal nuevaCantidad);

    // Configuración
    ExistenciaMaterial actualizarStockMinimo(Long sucursalId,Long materialId,BigDecimal stockMinimo);

    // Transferencias
    void transferirStock(Long sucursalOrigenId,Long sucursalDestinoId,Long materialId,BigDecimal cantidad);
}
