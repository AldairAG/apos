package com.api.apos.domain.material.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.material.Material;
import com.api.apos.domain.material.MaterialRepository;
import com.api.apos.domain.material.dto.MaterialDTO;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de materiales
 * Maneja todas las operaciones CRUD y consultas relacionadas con materiales
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MaterialServiceImpl implements MaterialService {
    
    private final MaterialRepository materialRepository;

    /**
     * Crear un nuevo material
     * @param material Material a crear
     * @return Material creado con timestamp
     */
    @Override
    public MaterialDTO createMaterial(Material material) {
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        if (material.getActivo() == null) {
            material.setActivo(true);
        }
        materialRepository.save(material);
        return mapMaterialToDTO(material);
    } 

    /**
     * Actualizar un material existente
     * @param id ID del material
     * @param material Datos actualizados
     * @return Material actualizado
     * @throws RuntimeException si el material no existe
     */
    @Override
    public Material actualizarMaterial(Long id, Material material) {
        Material materialExistente = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        
        materialExistente.setNombre(material.getNombre());
        materialExistente.setDescripcion(material.getDescripcion());
        materialExistente.setProveedor(material.getProveedor());
        materialExistente.setCategoriaInventario(material.getCategoriaInventario());
        materialExistente.setUnidadMedida(material.getUnidadMedida());
        materialExistente.setCostoUnitario(material.getCostoUnitario());
        materialExistente.setPerecedero(material.getPerecedero());
        materialExistente.setDiasVencimiento(material.getDiasVencimiento());
        materialExistente.setUpdatedAt(LocalDateTime.now());
        materialExistente.setUpdatedBy(material.getUpdatedBy());
        
        return materialRepository.save(materialExistente);
    }

    /**
     * Eliminar un material (borrado lógico)
     * @param id ID del material a eliminar
     * @throws RuntimeException si el material no existe
     */
    @Override
    public void eliminarMaterial(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        material.setActivo(false);
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    /**
     * Obtener un material por su ID
     * @param id ID del material
     * @return Optional con el material si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Material> obtenerMaterialPorId(Long id) {
        return materialRepository.findById(id);
    }

    /**
     * Obtener materiales por sucursal (a través del usuario)
     * @param idSucursal ID de la sucursal
     * @return Lista de materiales de la sucursal
     */
    @Override
    @Transactional(readOnly = true)
    public List<Material> getMaterialesPorSucursal(Long idSucursal) {
        // Implementación pendiente: requiere relación Material-Sucursal
        return materialRepository.findAll();
    }

    /**
     * Obtener solo materiales activos de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de materiales activos
     */
    @Override
    @Transactional(readOnly = true)
    public List<Material> getMaterialesActivos(Long idUsuario) {
        return materialRepository.findByActivoTrue();
    }

    /**
     * Cambiar el estado activo de un material
     * @param id ID del material
     * @param activo Nuevo estado
     * @return Material actualizado
     * @throws RuntimeException si el material no existe
     */
    @Override
    public Material cambiarEstadoActivo(Long id, boolean activo) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        material.setActivo(activo);
        material.setUpdatedAt(LocalDateTime.now());
        return materialRepository.save(material);
    }

    /**
     * Buscar materiales por término de búsqueda
     * Busca en nombre, código y descripción
     * @param idUsuario ID del usuario
     * @param termino Término de búsqueda
     * @return Lista de materiales que coinciden
     */
    @Override
    @Transactional(readOnly = true)
    public List<Material> buscarMateriales(Long idUsuario, String termino) {
        // Implementación básica - se puede mejorar con query personalizado
        List<Material> materiales = materialRepository.findByActivoTrue();
        return materiales.stream()
                .filter(m -> m.getNombre().toLowerCase().contains(termino.toLowerCase()) ||
                           (m.getDescripcion() != null && m.getDescripcion().toLowerCase().contains(termino.toLowerCase())))
                .toList();
    }

    private MaterialDTO mapMaterialToDTO(Material material) {
        return MaterialDTO.builder()
                .id(material.getId())
                .nombre(material.getNombre())
                .descripcion(material.getDescripcion())
                .proveedor(material.getProveedor())
                .categoriaInventario(material.getCategoriaInventario())
                .unidadMedida(material.getUnidadMedida())
                .costoUnitario(material.getCostoUnitario())
                .activo(material.getActivo())
                .perecedero(material.getPerecedero())
                .diasVencimiento(material.getDiasVencimiento())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .createdBy(material.getCreatedBy())
                .updatedBy(material.getUpdatedBy())
                .build();
    }
}
