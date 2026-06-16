package com.api.apos.domain.extra.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.extra.repository.ProductoGrupoExtraRepository;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de relaciones entre productos y grupos de extras
 * Define qué grupos de extras están disponibles para cada producto
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoGrupoExtraServiceImpl implements ProductoGrupoExtraService {
    
    private final ProductoGrupoExtraRepository productoGrupoExtraRepository;

    /**
     * Crear una nueva relación producto-grupo de extras
     * @param productoGrupoExtra Relación a crear
     * @return Relación creada con timestamp
     */
    @Override
    public ProductoGrupoExtra crearProductoGrupoExtra(ProductoGrupoExtra productoGrupoExtra) {
        productoGrupoExtra.setCreatedAt(LocalDateTime.now());
        productoGrupoExtra.setUpdatedAt(LocalDateTime.now());
        return productoGrupoExtraRepository.save(productoGrupoExtra);
    }

    /**
     * Actualizar una relación producto-grupo de extras existente
     * Permite modificar reglas como mínimo, máximo y obligatorio
     * @param id ID de la relación
     * @param productoGrupoExtra Datos actualizados
     * @return Relación actualizada
     * @throws RuntimeException si la relación no existe
     */
    @Override
    public ProductoGrupoExtra actualizarProductoGrupoExtra(Long id, ProductoGrupoExtra productoGrupoExtra) {
        ProductoGrupoExtra relacionExistente = productoGrupoExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relación producto-grupo de extras no encontrada con ID: " + id));
        
        relacionExistente.setMinimo(productoGrupoExtra.getMinimo());
        relacionExistente.setMaximo(productoGrupoExtra.getMaximo());
        relacionExistente.setObligatorio(productoGrupoExtra.getObligatorio());
        relacionExistente.setUpdatedAt(LocalDateTime.now());
        
        return productoGrupoExtraRepository.save(relacionExistente);
    }

    /**
     * Eliminar una relación producto-grupo de extras
     * @param id ID de la relación a eliminar
     * @throws RuntimeException si la relación no existe
     */
    @Override
    public void eliminarProductoGrupoExtra(Long id) {
        if (!productoGrupoExtraRepository.existsById(id)) {
            throw new RuntimeException("Relación producto-grupo de extras no encontrada con ID: " + id);
        }
        productoGrupoExtraRepository.deleteById(id);
    }

    /**
     * Obtener una relación producto-grupo de extras por su ID
     * @param id ID de la relación
     * @return Optional con la relación si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoGrupoExtra> obtenerProductoGrupoExtraPorId(Long id) {
        return productoGrupoExtraRepository.findById(id);
    }

    /**
     * Obtener todos los grupos de extras asociados a un producto
     * @param idProducto ID del producto
     * @return Lista de relaciones del producto
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoGrupoExtra> obtenerGruposPorProducto(Long idProducto) {
        return productoGrupoExtraRepository.findByProducto_Id(idProducto);
    }

    /**
     * Obtener todos los productos que tienen un grupo de extras específico
     * @param idGrupoExtra ID del grupo de extras
     * @return Lista de relaciones del grupo
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoGrupoExtra> obtenerProductosPorGrupo(Long idGrupoExtra) {
        return productoGrupoExtraRepository.findByGrupoExtra_Id(idGrupoExtra);
    }

    /**
     * Eliminar todos los grupos de extras asociados a un producto
     * Útil al eliminar o actualizar completamente los extras de un producto
     * @param idProducto ID del producto
     */
    @Override
    public void eliminarGruposPorProducto(Long idProducto) {
        productoGrupoExtraRepository.deleteByProducto_Id(idProducto);
    }
}
