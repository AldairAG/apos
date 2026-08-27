package com.api.apos.aplication.cuenta.mapper;

import com.api.apos.aplication.cuenta.dto.CuentaDto;
import com.api.apos.domain.cuenta.Cuenta;

public class CuentaMapper {
    
    public static CuentaDto toDto(Cuenta cuenta) {
        if (cuenta == null) {
            return null;
        }
        return CuentaDto.builder()
                .id(cuenta.getId())
                .nombre(cuenta.getNombre())
                .saldo(cuenta.getSaldo())
                .tipo(cuenta.getTipo())
                .updatedAt(cuenta.getUpdatedAt())
                .createdAt(cuenta.getCreatedAt())
                .build();
    }
}
