package com.api.apos.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.api.apos.dto.MaterialDTO;
import com.api.apos.entity.Material;
import com.api.apos.enums.TipoMaterial;
import com.api.apos.enums.TipoUnidad;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.repository.MaterialRepository;

/**
 * Controlador para gestionar materiales (ingredientes básicos, insumos, empaques)
 * Endpoints para CRUD completo de materiales
 */
@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    /**
     * GET /api/materiales
     * Obtiene todos los materiales registrados
     * @return Lista de todos los materiales
     */
    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<MaterialDTO>>> obtenerTodos() {
        List<Material> materiales = materialRepository.findAll();
        List<MaterialDTO> materialesDTO = materiales.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, materialesDTO, "Materiales obtenidos exitosamente"));
    }

    /**
     * GET /api/materiales/activos
     * Obtiene solo los materiales activos (disponibles para uso)
     * @return Lista de materiales activos
     */
    @GetMapping("/activos")
    public ResponseEntity<ApiResponseWrapper<List<MaterialDTO>>> obtenerActivos() {
        List<Material> materiales = materialRepository.findByActivoTrue();
        List<MaterialDTO> materialesDTO = materiales.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, materialesDTO, "Materiales activos obtenidos"));
    }

    /**
     * GET /api/materiales/{id}
     * Obtiene un material específico por su ID
     * @param id Identificador del material
     * @return Material encontrado o error 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<MaterialDTO>> obtenerPorId(@PathVariable Long id) {
        return materialRepository.findById(id)
            .map(material -> ResponseEntity.ok(
                new ApiResponseWrapper<>(true, convertirADTO(material), "Material encontrado")))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Material no encontrado")));
    }

    /**
     * POST /api/materiales
     * Crea un nuevo material en el sistema
     * @param materialDTO Datos del material a crear
     * @return Material creado con su ID asignado
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<MaterialDTO>> crear(@RequestBody MaterialDTO materialDTO) {
        try {
            Material material = new Material();
            material.setNombre(materialDTO.getNombre());
            material.setDescripcion(materialDTO.getDescripcion());
            material.setTipoMaterial(TipoMaterial.valueOf(materialDTO.getTipoMaterial()));
            material.setTipoUnidad(TipoUnidad.valueOf(materialDTO.getTipoUnidad()));
            material.setActivo(materialDTO.getActivo() != null ? materialDTO.getActivo() : true);
            
            Material guardado = materialRepository.save(material);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseWrapper<>(true, convertirADTO(guardado), "Material creado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, "Error al crear material: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/materiales/{id}
     * Actualiza un material existente
     * @param id ID del material a actualizar
     * @param materialDTO Nuevos datos del material
     * @return Material actualizado o error 404
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<MaterialDTO>> actualizar(
            @PathVariable Long id, 
            @RequestBody MaterialDTO materialDTO) {
        return materialRepository.findById(id)
            .map(material -> {
                material.setNombre(materialDTO.getNombre());
                material.setDescripcion(materialDTO.getDescripcion());
                material.setTipoMaterial(TipoMaterial.valueOf(materialDTO.getTipoMaterial()));
                material.setTipoUnidad(TipoUnidad.valueOf(materialDTO.getTipoUnidad()));
                material.setActivo(materialDTO.getActivo());
                
                Material actualizado = materialRepository.save(material);
                return ResponseEntity.ok(
                    new ApiResponseWrapper<>(true, convertirADTO(actualizado), "Material actualizado"));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Material no encontrado")));
    }

    /**
     * DELETE /api/materiales/{id}
     * Desactiva un material (soft delete) en lugar de eliminarlo
     * @param id ID del material a desactivar
     * @return Confirmación de desactivación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<String>> desactivar(@PathVariable Long id) {
        return materialRepository.findById(id)
            .map(material -> {
                material.setActivo(false);
                materialRepository.save(material);
                return ResponseEntity.ok(
                    new ApiResponseWrapper<>(true, "Material desactivado", "Material desactivado exitosamente"));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Material no encontrado")));
    }

    /**
     * Convierte una entidad Material a DTO para la respuesta API
     */
    private MaterialDTO convertirADTO(Material material) {
        return new MaterialDTO(
            material.getId(),
            material.getNombre(),
            material.getDescripcion(),
            material.getTipoMaterial() != null ? material.getTipoMaterial().name() : null,
            material.getTipoUnidad() != null ? material.getTipoUnidad().name() : null,
            material.getActivo()
        );
    }
}
