package com.api.apos.domain.caja.movimeinto.mapper;

import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

public class MovimientoMapper {
    public static MovimientoCajaDTO toDTO(MovimientoCaja movimiento) {
        MovimientoCajaDTO dto = new MovimientoCajaDTO();
        dto.setId(movimiento.getId());
        dto.setTipoMovimiento(movimiento.getTipoMovimiento());
        dto.setConceptoMovimiento(movimiento.getConceptoMovimiento());
        dto.setMetodoPago(movimiento.getMetodoPago());
        dto.setConcepto(movimiento.getConcepto());
        dto.setReferencia(movimiento.getReferencia());
        dto.setMonto(movimiento.getMonto());
        dto.setAprobado(movimiento.getAprobado());
        dto.setFecha(movimiento.getFecha());
        dto.setCreatedAt(movimiento.getCreatedAt());
        dto.setCreatedBy(movimiento.getCreatedBy());
        if (movimiento.getCaja() != null) {
            dto.setCajaId(movimiento.getCaja().getId());
        }
        if (movimiento.getEmpleado() != null) {
            dto.setEmpleadoId(movimiento.getEmpleado().getId());
        }
        if (movimiento.getOrden() != null) {
            dto.setOrdenId(movimiento.getOrden().getId());
        }
        return dto;
    }
}
