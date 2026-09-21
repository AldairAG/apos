package com.api.apos.aplication.cataogo.categoria.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CrearCategoriaUseCase {
    
    private final CategoriaService categoriaService;

    public CategoriaDto execute(CategoriaDto categoriaDto){

        Categoria categoria = Categoria.builder()
        .nombre(categoriaDto.getNombre())
        .build();
        
        return CategoriaMapper.toDto(categoriaService.save(categoria));

    }

}
