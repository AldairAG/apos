package com.api.apos.aplication.cataogo.modificadores.mapper;

import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.dto.OpcionDto;
import com.api.apos.domain.catalogo.complemento.Modificador;

import java.util.List;

public class ModificadorMapper {

    public static ModificadorDto toDto(Modificador modificador) {

        List<OpcionDto> opciones = modificador.getOpciones().stream()
            .map(OpcionMapper::toDto).toList();

        return ModificadorDto.builder()
                .id(modificador.getId())
                .nombre(modificador.getNombre())
                .opciones(opciones)
                .build();
    }

}
