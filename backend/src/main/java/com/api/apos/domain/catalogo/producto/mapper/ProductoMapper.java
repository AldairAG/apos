package com.api.apos.domain.catalogo.producto.mapper;

import com.api.apos.domain.catalogo.extra.mapper.ExtraMapper;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.dto.ProductoDTO;

public class ProductoMapper {
    public static ProductoDTO toDTO(Producto producto) {
        if (producto == null) {
            return null;
        }
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setCodigo(producto.getCodigo());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecioVenta(producto.getPrecioVenta());
        dto.setCosto(producto.getCosto());
        dto.setMargen(producto.getMargen());
        dto.setTiempoPreparacion(producto.getTiempoPreparacion());
        dto.setActivo(producto.getActivo());
        dto.setDisponible(producto.getDisponible());
        dto.setDestacado(producto.getDestacado());
        dto.setCreatedAt(producto.getCreatedAt());
        dto.setUpdatedAt(producto.getUpdatedAt());
        dto.setCreatedBy(producto.getCreatedBy());
        dto.setUpdatedBy(producto.getUpdatedBy());
        dto.setReceta(producto.getReceta());
        dto.setCategoria(producto.getCategoria());
        dto.setGruposExtra(producto.getGruposExtra().stream()
                .map(ExtraMapper::toDTO)
                .toList());
        return dto;
    }
}
