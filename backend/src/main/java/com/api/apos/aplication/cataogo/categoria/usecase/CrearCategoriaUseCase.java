package com.api.apos.aplication.cataogo.categoria.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CrearCategoriaUseCase {
    
    private final CategoriaService categoriaService;

    private final SucursalService sucursalService;

    public CategoriaDto execute(CategoriaDto categoriaDto){

        Sucursal sucursal = sucursalService.findById(categoriaDto.getSucursalId());

        Categoria categoria = Categoria.builder()
        .nombre(categoriaDto.getNombre())
        .build();

        sucursal.addCategoria(categoria);
        
        return CategoriaMapper.toDto(categoriaService.save(categoria));

    }

}
