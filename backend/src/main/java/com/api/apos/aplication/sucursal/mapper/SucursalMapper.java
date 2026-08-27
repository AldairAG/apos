package com.api.apos.aplication.sucursal.mapper;

import com.api.apos.aplication.sucursal.dto.SucursalDto;
import com.api.apos.domain.sucursal.Sucursal;

public class SucursalMapper {
    
    public static SucursalDto toDto(Sucursal sucursal) {
        SucursalDto dto = SucursalDto.builder()
                .id(sucursal.getId())
                .nombre(sucursal.getNombre())
                .codigo(sucursal.getCodigo())
                .activa(sucursal.getActiva())
                .direccion(sucursal.getDireccion())
                .telefono(sucursal.getTelefono())
                .build();
        return dto;
    }

}
