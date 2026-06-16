package com.api.apos.domain.extra.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.extra.entity.ProductoGrupoExtra;

public interface ProductoGrupoExtraService {
    ProductoGrupoExtra crearProductoGrupoExtra(ProductoGrupoExtra productoGrupoExtra);
    ProductoGrupoExtra actualizarProductoGrupoExtra(Long id, ProductoGrupoExtra productoGrupoExtra);
    void eliminarProductoGrupoExtra(Long id);
    Optional<ProductoGrupoExtra> obtenerProductoGrupoExtraPorId(Long id);
    List<ProductoGrupoExtra> obtenerGruposPorProducto(Long idProducto);
    List<ProductoGrupoExtra> obtenerProductosPorGrupo(Long idGrupoExtra);
    void eliminarGruposPorProducto(Long idProducto);
}
