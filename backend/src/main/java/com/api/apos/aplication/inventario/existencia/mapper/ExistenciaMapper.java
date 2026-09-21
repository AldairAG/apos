package com.api.apos.aplication.inventario.existencia.mapper;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.material.dto.MaterialDto;
import com.api.apos.aplication.inventario.material.mapper.MaterialMapper;
import com.api.apos.domain.inventario.existencia.Existencia;

public class ExistenciaMapper {
 
    public static ExistenciaDto toDto(Existencia existencia) {

        MaterialDto materialDto= MaterialMapper.toDto(existencia.getMaterial());

        return ExistenciaDto.builder()
                .cantidadActual(existencia.getCantidadActual())
                .cantidadMinima(existencia.getCantidadMinima())
                .material(materialDto)
                .unidadMedida(existencia.getUnidadMedida())
                .build();
    }

}
