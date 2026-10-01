package com.api.apos.aplication.inventario.existencia.mapper;

import com.api.apos.aplication.inventario.existencia.dto.MovimientoInventarioDto;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventario;

public final class MovimientoInventarioMapper {

    public static MovimientoInventarioDto toDto(MovimientoInventario movimiento) {
        return MovimientoInventarioDto.builder()
                .id(movimiento.getId())
                .materialId(movimiento.getMaterialId())
                .materialNombre(movimiento.getMaterialNombre())
                .sucursalId(movimiento.getSucursalId())
                .sucursalNombre(movimiento.getSucursalNombre())
                .cantidad(movimiento.getCantidad())
                .tipoMovimiento(movimiento.getTipoMovimiento())
                .conceptoMovimiento(movimiento.getConceptoMovimiento())
                .usuarioId(movimiento.getUsuarioId())
                .usuarioNombre(movimiento.getUsuarioNombre())
                .fecha(movimiento.getFecha())
                .build();
    }

    private MovimientoInventarioMapper() {
    }
}