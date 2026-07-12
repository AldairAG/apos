package com.api.apos.domain.inventario.existencias.service;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;

public interface ExistenciaService {
    // Consultas
    ExistenciaMaterial obtenerPorId(Long id);

    List<ExistenciaMaterial> obtenerPorIds(List<Long> materialIds, Long sucursalId);

    ExistenciaMaterial obtenerExistencia(Long sucursalId,Long materialId);

    List<ExistenciaMaterial> obtenerInventarioSucursal(Long sucursalId);

    List<ExistenciaMaterial> obtenerStockBajo(Long sucursalId);

    List<ExistenciaMaterial> guardarExistencias(List<ExistenciaMaterial> existencias);

    // Movimientos
    ExistenciaMaterial agregarStock(Long sucursalId,Long materialId,BigDecimal cantidad);

    ExistenciaMaterial descontarStock(Long sucursalId,Long materialId,BigDecimal cantidad);

    ExistenciaMaterial ajustarStock(Long sucursalId,Long materialId,BigDecimal nuevaCantidad);

}
