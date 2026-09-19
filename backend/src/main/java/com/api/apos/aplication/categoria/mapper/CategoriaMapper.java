package com.api.apos.aplication.categoria.mapper;

import com.api.apos.aplication.categoria.dto.CategoriaDto;
import com.api.apos.domain.catalogo.categoria.Categoria;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class CategoriaMapper {
    
    public static CategoriaDto toDto(Categoria categoria){

        return CategoriaDto.builder()
            .id(null)
            .nombre(null)
            .build();
    }

}
