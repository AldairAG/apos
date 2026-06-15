package com.api.apos.domain.categoria.service;

import java.util.List;

import com.api.apos.domain.categoria.entity.Categoria;

public interface CategoriaService {
    Categoria crearCategoria(Categoria categoria);
    Categoria actualizarCategoria(Long id, Categoria categoria);
    void eliminarCategoria(Long id);
    Categoria obtenerCategoriaPorId(Long id);
    List<Categoria> obtenerCategoriasPorUsuario(Long idUsuario);
    List<Categoria> obtenerCategoriasActivas(Long idUsuario);
}
