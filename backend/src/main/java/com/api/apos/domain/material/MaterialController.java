package com.api.apos.domain.material;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.material.service.MaterialService;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de materiales
 * Endpoints: /api/materiales
 */
@RestController
@RequestMapping("/api/materiales")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    /**
     * Crear un nuevo material
     * POST /api/materiales
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Material>> crearMaterial(@RequestBody Material material) {
        try {
            Material nuevoMaterial = materialService.createMaterial(material);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevoMaterial, "Material creado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar un material existente
     * PUT /api/materiales/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Material>> actualizarMaterial(
            @PathVariable Long id,
            @RequestBody Material material) {
        try {
            Material materialActualizado = materialService.actualizarMaterial(id, material);
            return ResponseEntity
                    .ok(new ApiResponseWrapper<>(true, materialActualizado, "Material actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar un material (borrado lógico)
     * DELETE /api/materiales/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarMaterial(@PathVariable Long id) {
        try {
            materialService.eliminarMaterial(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Material eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener un material por ID
     * GET /api/materiales/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Material>> obtenerMaterialPorId(@PathVariable Long id) {
        return materialService.obtenerMaterialPorId(id)
                .map(material -> ResponseEntity.ok(new ApiResponseWrapper<>(true, material, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Material no encontrado")));
    }

    /**
     * Obtener materiales activos de un usuario
     * GET /api/materiales/usuario/{idUsuario}/activos
     */
    @GetMapping("/usuario/{idUsuario}/activos")
    public ResponseEntity<ApiResponseWrapper<List<Material>>> obtenerMaterialesActivos(@PathVariable Long idUsuario) {
        try {
            List<Material> materiales = materialService.getMaterialesActivos(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, materiales, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener materiales activos de un usuario
     * GET /api/materiales/usuario/{idUsuario}/activos
     */
    @GetMapping("/usuario")
    public ResponseEntity<ApiResponseWrapper<List<Material>>> obtenerMaterialesPorUsuario() {
        try {

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            Long idUsuario = ((Usuario) authentication.getPrincipal()).getId();

            List<Material> materiales = materialService.getMaterialesActivos(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, materiales, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Buscar materiales por término
     * GET /api/materiales/buscar?termino=xxx&idUsuario=1
     */
    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseWrapper<List<Material>>> buscarMateriales(
            @RequestParam String termino,
            @RequestParam Long idUsuario) {
        try {
            List<Material> materiales = materialService.buscarMateriales(idUsuario, termino);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, materiales, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado activo de un material
     * PATCH /api/materiales/{id}/estado?activo=true
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Material>> cambiarEstadoActivo(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        try {
            Material material = materialService.cambiarEstadoActivo(id, activo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, material, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
