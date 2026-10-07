package com.api.apos.aplication.cataogo.producto.mapper;

import java.util.List;
import java.util.Optional;

import com.api.apos.aplication.cataogo.categoria.mapper.CategoriaMapper;
import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.mapper.ModificadorMapper;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto;
import com.api.apos.domain.catalogo.producto.Producto;

public class ProductoMapper {

    public static ProductoDto toDto(Producto producto) {

        List<ModificadorDto> modificadorProductos = Optional.ofNullable(producto.getModificadorProductos())
                .orElse(List.of())
                .stream()
                .filter(t -> t.getModificador() != null)
                .map(t -> ModificadorMapper.toDto(t.getModificador()))
                .toList();

        List<Long> modificadorIds = modificadorProductos.stream()
                .map(ModificadorDto::getId)
                .toList();

        List<RecetaDetallesDto> detalles = Optional.ofNullable(producto.getRecetaDetalles())
                .orElse(List.of())
                .stream()
                .map(detalle -> RecetaDetallesDto.builder()
                        .id(detalle.getId())
                        .cantidad(detalle.getCantidad())
                        .unidadMedida(detalle.getUnidadMedida())
                        .costo(detalle.getCosto())
                        .nombreMaterial(detalle.getMaterial().getNombre())
                        .materialId(detalle.getMaterial().getId())
                        .build())
                .toList();

        return ProductoDto.builder()
                .recetaDetalles(detalles)
                .categoria(CategoriaMapper.toDto(producto.getCategoria()))
                .costo(producto.getCosto())
                .disponible(producto.getDisponible())
                .id(producto.getId())
                .margenGanancia(producto.getMargenGanancia())
                .modificadores(modificadorProductos)
                .modificadorIds(modificadorIds)
                .nombre(producto.getNombre())
                .precio(producto.getPrecio())
                .porcentajeSobreCostos(producto.getPorcentajeSobreCostos())
                .sucursalId(producto.getSucursal().getId())
                .build();
    }

}
