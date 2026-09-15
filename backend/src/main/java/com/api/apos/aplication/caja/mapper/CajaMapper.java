package com.api.apos.aplication.caja.mapper;

import com.api.apos.aplication.caja.dto.CajaDto;
import com.api.apos.domain.financiero.caja.Caja;

public class CajaMapper {

    public static CajaDto toDto(Caja caja) {
        if (caja == null) {
            return null;
        }
        
        CajaDto cajaDto = CajaDto.builder()
                .id(caja.getId())
                .nombre(caja.getNombre())
                .saldo(caja.getSaldo())
                .saldoInicial(caja.getSaldoInicial())
                .estado(caja.getEstado())
                .build();

        return cajaDto;

    }

}
