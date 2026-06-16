package com.api.apos.domain.extra;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.extra.entity.OpcionExtra;
import com.api.apos.domain.extra.service.OpcionExtraService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de opciones de extras
 * Endpoints: /api/opciones-extras
 */
@RestController
@RequestMapping("/api/opciones-extras")
@RequiredArgsConstructor
public class OpcionExtraController {

    private final OpcionExtraService opcionExtraService;

    /**
     * Crear una nueva opción de extra
     * POST /api/opciones-extras
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<OpcionExtra>> crearOpcionExtra(@RequestBody OpcionExtra opcionExtra) {
        try {
            OpcionExtra nuevaOpcion = opcionExtraService.crearOpcionExtra(opcionExtra);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaOpcion, "Opción de extra creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar una opción de extra existente
     * PUT /api/opciones-extras/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<OpcionExtra>> actualizarOpcionExtra(
            @PathVariable Long id,
            @RequestBody OpcionExtra opcionExtra) {
        try {
            OpcionExtra opcionActualizada = opcionExtraService.actualizarOpcionExtra(id, opcionExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, opcionActualizada, "Opción de extra actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar una opción de extra (borrado lógico)
     * DELETE /api/opciones-extras/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarOpcionExtra(@PathVariable Long id) {
        try {
            opcionExtraService.eliminarOpcionExtra(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Opción de extra eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener una opción de extra por ID
     * GET /api/opciones-extras/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<OpcionExtra>> obtenerOpcionExtraPorId(@PathVariable Long id) {
        return opcionExtraService.obtenerOpcionExtraPorId(id)
                .map(opcion -> ResponseEntity.ok(new ApiResponseWrapper<>(true, opcion, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Opción de extra no encontrada")));
    }

    /**
     * Obtener opciones de extras por grupo
     * GET /api/opciones-extras/grupo/{idGrupoExtra}
     */
    @GetMapping("/grupo/{idGrupoExtra}")
    public ResponseEntity<ApiResponseWrapper<List<OpcionExtra>>> obtenerOpcionesExtraPorGrupo(@PathVariable Long idGrupoExtra) {
        try {
            List<OpcionExtra> opciones = opcionExtraService.obtenerOpcionesExtraPorGrupo(idGrupoExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, opciones, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener opciones de extras activas por grupo
     * GET /api/opciones-extras/grupo/{idGrupoExtra}/activas
     */
    @GetMapping("/grupo/{idGrupoExtra}/activas")
    public ResponseEntity<ApiResponseWrapper<List<OpcionExtra>>> obtenerOpcionesExtraActivas(@PathVariable Long idGrupoExtra) {
        try {
            List<OpcionExtra> opciones = opcionExtraService.obtenerOpcionesExtraActivas(idGrupoExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, opciones, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado activo de una opción de extra
     * PUT /api/opciones-extras/{id}/estado?activo=true
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<OpcionExtra>> cambiarEstadoActivo(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        try {
            OpcionExtra opcion = opcionExtraService.cambiarEstadoActivo(id, activo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, opcion, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
