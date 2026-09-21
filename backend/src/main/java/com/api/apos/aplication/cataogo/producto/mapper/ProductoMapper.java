package com.api.apos.aplication.cataogo.producto.mapper;

import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.aplication.cataogo.modificadores.mapper.ModificadorMapper;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.catalogo.producto.Producto;

public class ProductoMapper {

    public static ProductoDto toDto(Producto producto) {

        return ProductoDto.builder()
                .categoria(CategoriaMapper.toDto(producto.getCategoria()))
                .costo(producto.getCosto())
                .disponible(producto.getDisponible())
                .id(producto.getId())
                .margenGanancia(producto.getMargenGanancia())
                .modificadores(
                        producto.getModificadorProductos().stream()
                                .map(t -> {
                                    return ModificadorMapper.toDto(t.getModificador());
                                })
                                .toList())
                .nombre(producto.getNombre())
                .precio(producto.getPrecio())
                .receta(RecetaMapper.toDto(producto.getReceta()))
                .sucursalId(producto.getSucursal().getId())
                .build();
    }

}
