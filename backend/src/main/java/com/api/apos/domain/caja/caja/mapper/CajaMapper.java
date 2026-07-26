package com.api.apos.domain.caja.caja.mapper;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.dto.CajaDTO;

public class CajaMapper {
    public static CajaDTO toDTO(Caja caja) {
        return CajaDTO.builder()
                .id(caja.getId())
                .nombre(caja.getNombre())
                .activa(caja.getActiva())
                .estado(caja.getEstado())
                .build();
    }
}
