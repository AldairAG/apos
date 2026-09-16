package com.api.apos.aplication.movimiento.mapper;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.domain.financiero.movimiento.Movimiento;

public class MovimientoMapper {
    public static MovimientoDto toDto(Movimiento movimiento) {
        return MovimientoDto.builder()
                .id(movimiento.getId())
                .descripcion(movimiento.getDescripcion())
                .monto(movimiento.getMonto())
                .tipo(movimiento.getTipo())
                .estado(movimiento.getEstado())
                .cuentaId(movimiento.getCuenta() != null ? movimiento.getCuenta().getId() : null)
                .corteCajaId(movimiento.getCorteCaja() != null ? movimiento.getCorteCaja().getId() : null)
                .cajaId(movimiento.getCorteCaja() != null && movimiento.getCorteCaja().getCaja() != null ? movimiento.getCorteCaja().getCaja().getId() : null)
                .categoria(movimiento.getCategoria())
                .createdBy(movimiento.getCreatedBy())
                .updatedAt(movimiento.getUpdatedAt())
                .createdAt(movimiento.getCreatedAt())
                .fecha(movimiento.getFecha())
                .build();
    }


}
