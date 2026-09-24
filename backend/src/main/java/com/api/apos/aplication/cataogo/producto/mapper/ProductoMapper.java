package com.api.apos.aplication.cataogo.producto.mapper;

import java.util.Optional;
import java.util.List;

import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.mapper.ModificadorMapper;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.catalogo.producto.Producto;

public class ProductoMapper {

    public static ProductoDto toDto(Producto producto) {

        List<ModificadorDto> modificadorProductos = Optional.ofNullable(producto.getModificadorProductos())
                .orElse(List.of())
                .stream()
                .filter(t -> t.getModificador() != null)
                .map(t -> ModificadorMapper.toDto(t.getModificador()))
                .toList();

        return ProductoDto.builder()
                .categoria(CategoriaMapper.toDto(producto.getCategoria()))
                .costo(producto.getCosto())
                .disponible(producto.getDisponible())
                .id(producto.getId())
                .margenGanancia(producto.getMargenGanancia())
                .modificadores(modificadorProductos)
                .nombre(producto.getNombre())
                .precio(producto.getPrecio())
                .receta(RecetaMapper.toDto(producto.getReceta()))
                .sucursalId(producto.getSucursal().getId())
                .build();
    }

}
