package com.api.apos.aplication.empresa.controller.mapper;

import com.api.apos.aplication.empresa.controller.dto.EmpresaDto;
import com.api.apos.domain.empresa.Empresa;

public class EmpresaMapper {
    public static EmpresaDto toDto(Empresa empresa) {
        EmpresaDto dto = new EmpresaDto();
        dto.setNombre(empresa.getNombre());
        dto.setImgUrl(empresa.getLogoUrl());
        return dto;
    }
}
