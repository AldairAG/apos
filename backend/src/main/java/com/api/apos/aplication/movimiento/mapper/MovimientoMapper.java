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
                .cuentaId(movimiento.getCuenta().getId())
                .categoria(movimiento.getCategoria())
                .createdBy(movimiento.getCreatedBy())
                .updatedAt(movimiento.getUpdatedAt())
                .createdAt(movimiento.getCreatedAt())
                .build();
    }


}
