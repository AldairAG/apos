package com.api.apos.aplication.cataogo.categoria.query;

import org.springframework.stereotype.Service;
import java.util.List;

import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.domain.catalogo.categoria.Categoria;

import lombok.AllArgsConstructor;

@AllArgsConstructor 
@Service 
public class FindCategoriaBySucursalId {
    
    private final CategoriaService categoriaService;

    public List<CategoriaDto> execute(Long sucursalId) {
        List<Categoria> categorias = categoriaService.findBySucursalId(sucursalId);

        return categorias.stream().map(CategoriaMapper::toDto).toList();
    }

}
