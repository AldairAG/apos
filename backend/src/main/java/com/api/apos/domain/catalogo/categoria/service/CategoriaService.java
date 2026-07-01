package com.api.apos.domain.catalogo.categoria.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.catalogo.categoria.entity.Categoria;
import com.api.apos.domain.catalogo.producto.Producto;

public interface CategoriaService {
    Categoria crearCategoria(Categoria categoria);
    Categoria actualizarCategoria(Long id, Categoria categoria);
    void eliminarCategoria(Long id);
    Optional<Categoria> obtenerCategoriaPorId(Long id);
    List<Categoria> obtenerCategoriasPorUsuario();
    List<Categoria> obtenerCategoriasActivas(Long idUsuario);
    List<Producto> obtenerProductosPorCategoria(Long idCategoria);
    Categoria cambiarEstadoActivo(Long id, boolean activo);
}
