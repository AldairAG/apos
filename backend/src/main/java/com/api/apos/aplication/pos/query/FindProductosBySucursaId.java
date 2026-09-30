package com.api.apos.aplication.pos.query;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.pos.dto.CategoriaProductoDto;
import com.api.apos.aplication.pos.mapper.PosMapper;
import com.api.apos.domain.catalogo.categoria.CategoriaService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindProductosBySucursaId {
    
    private final CategoriaService categoriaService;

    public List<CategoriaProductoDto> execute(Long sucursalId) {

        return categoriaService.findBySucursalId(sucursalId)
                .stream()
                .map(PosMapper::mapToCategoriaProductoDtoList)
                .collect(Collectors.toList());
    }
}
