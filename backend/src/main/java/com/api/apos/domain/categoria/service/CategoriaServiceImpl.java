package com.api.apos.domain.categoria.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.categoria.entity.Categoria;
import com.api.apos.domain.categoria.repository.CategoriaRepository;
import com.api.apos.domain.producto.Producto;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de categorías
 * Maneja operaciones CRUD y consultas de categorías de productos
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaServiceImpl implements CategoriaService {
    
    private final CategoriaRepository categoriaRepository;

    /**
     * Crear una nueva categoría
     * @param categoria Categoría a crear
     * @return Categoría creada con timestamp
     */
    @Override
    public Categoria crearCategoria(Categoria categoria) {
        categoria.setCreatedAt(LocalDateTime.now());
        categoria.setUpdatedAt(LocalDateTime.now());
        if (categoria.getActivo() == null) {
            categoria.setActivo(true);
        }
        if (categoria.getOrden() == null) {
            categoria.setOrden(0);
        }
        return categoriaRepository.save(categoria);
    }

    /**
     * Actualizar una categoría existente
     * @param id ID de la categoría
     * @param categoria Datos actualizados
     * @return Categoría actualizada
     * @throws RuntimeException si la categoría no existe
     */
    @Override
    public Categoria actualizarCategoria(Long id, Categoria categoria) {
        Categoria categoriaExistente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        categoriaExistente.setNombre(categoria.getNombre());
        categoriaExistente.setDescripcion(categoria.getDescripcion());
        categoriaExistente.setOrden(categoria.getOrden());
        categoriaExistente.setUpdatedAt(LocalDateTime.now());
        categoriaExistente.setUpdatedBy(categoria.getUpdatedBy());
        
        return categoriaRepository.save(categoriaExistente);
    }

    /**
     * Eliminar una categoría (borrado lógico)
     * @param id ID de la categoría a eliminar
     * @throws RuntimeException si la categoría no existe
     */
    @Override
    public void eliminarCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        categoria.setActivo(false);
        categoria.setUpdatedAt(LocalDateTime.now());
        categoriaRepository.save(categoria);
    }

    /**
     * Obtener una categoría por su ID
     * @param id ID de la categoría
     * @return Optional con la categoría si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Categoria> obtenerCategoriaPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    /**
     * Obtener todas las categorías de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de categorías del usuario
     */
    @Override
    @Transactional(readOnly = true)
    public List<Categoria> obtenerCategoriasPorUsuario(Long idUsuario) {
        return categoriaRepository.findByUsuario_IdOrderByOrdenAsc(idUsuario);
    }

    /**
     * Obtener solo categorías activas de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de categorías activas
     */
    @Override
    @Transactional(readOnly = true)
    public List<Categoria> obtenerCategoriasActivas(Long idUsuario) {
        return categoriaRepository.findByUsuario_IdAndActivoTrue(idUsuario);
    }

    /**
     * Obtener categorías ordenadas por campo orden
     * Útil para mostrar menús en el POS
     * @param idUsuario ID del usuario
     * @return Lista de categorías ordenadas
     */
    @Override
    @Transactional(readOnly = true)
    public List<Categoria> obtenerCategoriasOrdenadas(Long idUsuario) {
        return categoriaRepository.findByUsuario_IdAndActivoTrueOrderByOrdenAsc(idUsuario);
    }

    /**
     * Obtener todos los productos de una categoría
     * @param idCategoria ID de la categoría
     * @return Lista de productos de la categoría
     * @throws RuntimeException si la categoría no existe
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosPorCategoria(Long idCategoria) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + idCategoria));
        return categoria.getProductos();
    }

    /**
     * Cambiar el estado activo de una categoría
     * @param id ID de la categoría
     * @param activo Nuevo estado
     * @return Categoría actualizada
     * @throws RuntimeException si la categoría no existe
     */
    @Override
    public Categoria cambiarEstadoActivo(Long id, boolean activo) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        categoria.setActivo(activo);
        categoria.setUpdatedAt(LocalDateTime.now());
        return categoriaRepository.save(categoria);
    }

    /**
     * Actualizar el orden de visualización de una categoría
     * @param id ID de la categoría
     * @param nuevoOrden Nuevo número de orden
     * @return Categoría actualizada
     * @throws RuntimeException si la categoría no existe
     */
    @Override
    public Categoria actualizarOrden(Long id, Integer nuevoOrden) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        categoria.setOrden(nuevoOrden);
        categoria.setUpdatedAt(LocalDateTime.now());
        return categoriaRepository.save(categoria);
    }
}
