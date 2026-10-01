package com.api.apos.aplication.inventario.existencia.mapper;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.material.dto.MaterialDto;
import com.api.apos.aplication.inventario.material.mapper.MaterialMapper;
import com.api.apos.domain.inventario.existencia.Existencia;

public class ExistenciaMapper {
 
    public static ExistenciaDto toDto(Existencia existencia) {

        MaterialDto materialDto = existencia.getMaterial() == null
            ? null
            : MaterialMapper.toDto(existencia.getMaterial());

        return ExistenciaDto.builder()
            .id(existencia.getId())
                .cantidadActual(existencia.getCantidadActual())
                .cantidadMinima(existencia.getCantidadMinima())
            .estado(existencia.getEstado())
                .material(materialDto)
                .unidadMedida(existencia.getUnidadMedida())
                .materialId(existencia.getMaterial() == null ? null : existencia.getMaterial().getId())
                .sucursalId(existencia.getSucursal() == null ? null : existencia.getSucursal().getId())
                .build();
    }

}
