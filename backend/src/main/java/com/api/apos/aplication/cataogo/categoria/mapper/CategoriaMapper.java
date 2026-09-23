package com.api.apos.aplication.cataogo.categoria.mapper;

import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.domain.catalogo.categoria.Categoria;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class CategoriaMapper {
    
    public static CategoriaDto toDto(Categoria categoria){

        return CategoriaDto.builder()
            .id(categoria.getId())
            .nombre(categoria.getNombre())
            .sucursalId(categoria.getSucursal() == null ? null : categoria.getSucursal().getId())
            .build();
    }

}
