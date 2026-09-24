package com.api.apos.aplication.cataogo.producto.query;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.cataogo.producto.mapper.ProductoMapper;
import com.api.apos.domain.catalogo.producto.ProductoService;

@AllArgsConstructor
@Service
public class FindProductosBySucursalId {

    private final ProductoService productoService;

    public List<ProductoDto> execute(Long sucursalId) {
        return productoService.findBySucursalId(sucursalId)
                .stream()
                .map(ProductoMapper::toDto)
                .toList();
    }

}