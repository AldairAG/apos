package com.api.apos.domain.pos.mapper;

import com.api.apos.domain.catalogo.producto.dto.ProductoDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse;

public class PosMapper {
    public static ProductosBySucursalResponse toProductosBySucursalResponse(ProductoDTO producto) {
        if (producto == null) {
            return null;
        }
        ProductosBySucursalResponse res = new ProductosBySucursalResponse();
        res.setId(producto.getId());
        res.setNombre(producto.getNombre());
        //res.setCodigo(producto.getCodigo());
        res.setDescripcion(producto.getDescripcion());
        res.setPrecioVenta(producto.getPrecioVenta());
        //res.setCosto(producto.getCosto());
        //res.setMargen(producto.getMargen());
        res.setTiempoPreparacion(producto.getTiempoPreparacion());
        res.setActivo(producto.getActivo());
        res.setDisponible(producto.getDisponible());
        res.setDestacado(producto.getDestacado());
        //res.setCreatedAt(producto.getCreatedAt());
        //res.setUpdatedAt(producto.getUpdatedAt());
        //res.setCreatedBy(producto.getCreatedBy());
        //res.setUpdatedBy(producto.getUpdatedBy());
        //res.setReceta(producto.getReceta());
        res.setCategoria(producto.getCategoria());
        // Aquí puedes mapear los grupos extra si es necesario
        return res;
    }
}
