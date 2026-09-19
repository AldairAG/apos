package com.api.apos.aplication.modificadores.mapper;

import com.api.apos.aplication.modificadores.dto.OpcionDto;
import com.api.apos.domain.catalogo.modificadores.Opcion;

public class OpcionMapper {

    public static OpcionDto toDto(Opcion opcion) {
        return OpcionDto.builder()
                .id(opcion.getId())
                .maximo(opcion.getMaximo())
                .precio(opcion.getPrecio())
                .build();
    }

    public static Opcion toEntity(OpcionDto opcionDto){
        return Opcion.builder()
        .costo(opcionDto.getCosto())
        .nombre(opcionDto.getNombre())
        .precio(opcionDto.getPrecio())
        .build();
    }

}
