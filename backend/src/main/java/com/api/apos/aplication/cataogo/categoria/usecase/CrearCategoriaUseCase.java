package com.api.apos.aplication.cataogo.categoria.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.domain.organizacion.empresa.EmpresaService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CrearCategoriaUseCase {
    
    private final CategoriaService categoriaService;

    private final EmpresaService empresaService;

    public CategoriaDto execute(CategoriaDto categoriaDto){

        Empresa empresa = empresaService.findById(categoriaDto.getEmpresaId());

        Categoria categoria = Categoria.builder()
        .nombre(categoriaDto.getNombre())
        .build();

        empresa.addCategoria(categoria);
        
        return CategoriaMapper.toDto(categoriaService.save(categoria));

    }

}
