package com.api.apos.domain.extra.service;

import java.util.List;

import com.api.apos.domain.extra.entity.ProductoGrupoExtra;

public interface ProductoGrupoExtraService {
    ProductoGrupoExtra crearProductoGrupoExtra(ProductoGrupoExtra productoGrupoExtra);
    ProductoGrupoExtra actualizarProductoGrupoExtra(Long id, ProductoGrupoExtra productoGrupoExtra);
    void eliminarProductoGrupoExtra(Long id);
    ProductoGrupoExtra obtenerProductoGrupoExtraPorId(Long id);
    List<ProductoGrupoExtra> obtenerGruposPorProducto(Long idProducto);
    List<ProductoGrupoExtra> obtenerProductosPorGrupo(Long idGrupoExtra);
}
