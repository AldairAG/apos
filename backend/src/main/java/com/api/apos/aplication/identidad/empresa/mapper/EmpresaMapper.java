package com.api.apos.aplication.identidad.empresa.mapper;

import com.api.apos.aplication.identidad.empresa.dto.EmpresaDto;
import com.api.apos.domain.organizacion.empresa.Empresa;

public class EmpresaMapper {
    public static EmpresaDto toDto(Empresa empresa) {
        EmpresaDto dto = new EmpresaDto();
        dto.setNombre(empresa.getNombre());
        dto.setImgUrl(empresa.getLogoUrl());
        return dto;
    }
}
