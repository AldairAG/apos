package com.api.apos.aplication.movimiento.mapper;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.domain.movimiento.Movimiento;

public class MovimientoMapper {
    public MovimientoDto toDto(Movimiento movimiento) {
        return MovimientoDto.builder()
                .id(movimiento.getId())
                .descripcion(movimiento.getDescripcion())
                .monto(movimiento.getMonto())
                .tipo(movimiento.getTipo())
                .estado(movimiento.getEstado())
                .categoria(movimiento.getCategoria())
                .createdBy(movimiento.getCreatedBy())
                .cuentaDestinoId(movimiento.getCuentaDestinoId())
                .cuentaOrigenId(movimiento.getCuentaOrigenId())
                .updatedAt(movimiento.getUpdatedAt())
                .createdAt(movimiento.getCreatedAt())
                .build();
    }


}
