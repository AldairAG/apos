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

import com.api.apos.domain.extra.dto.CreateGrupoExtraDTO;
import com.api.apos.domain.extra.entity.GrupoExtra;
import com.api.apos.domain.extra.service.GrupoExtraService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de grupos de extras
 * Endpoints: /api/grupos-extras
 */
@RestController
@RequestMapping("/api/grupos-extra")
@RequiredArgsConstructor
public class GrupoExtraController {

    private final GrupoExtraService grupoExtraService;

    /**
     * Crear un nuevo grupo de extras
     * POST /api/grupos-extra
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<GrupoExtra>> crearGrupoExtra(@RequestBody CreateGrupoExtraDTO grupoExtra) {
        try {
            GrupoExtra nuevoGrupo = grupoExtraService.crearGrupoExtra(grupoExtra);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevoGrupo, "Grupo de extras creado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar un grupo de extras existente
     * PUT /api/grupos-extras/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<GrupoExtra>> actualizarGrupoExtra(
            @PathVariable Long id,
            @RequestBody GrupoExtra grupoExtra) {
        try {
            GrupoExtra grupoActualizado = grupoExtraService.actualizarGrupoExtra(id, grupoExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, grupoActualizado, "Grupo de extras actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar un grupo de extras (borrado lógico)
     * DELETE /api/grupos-extras/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarGrupoExtra(@PathVariable Long id) {
        try {
            grupoExtraService.eliminarGrupoExtra(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Grupo de extras eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener un grupo de extras por ID
     * GET /api/grupos-extras/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<GrupoExtra>> obtenerGrupoExtraPorId(@PathVariable Long id) {
        return grupoExtraService.obtenerGrupoExtraPorId(id)
                .map(grupo -> ResponseEntity.ok(new ApiResponseWrapper<>(true, grupo, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Grupo de extras no encontrado")));
    }

    /**
     * Obtener grupos de extras de un usuario
     * GET /api/grupos-extras/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<ApiResponseWrapper<List<GrupoExtra>>> obtenerGruposExtraPorUsuario(@PathVariable Long idUsuario) {
        try {
            List<GrupoExtra> grupos = grupoExtraService.obtenerGruposExtraPorUsuario(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, grupos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener grupos de extras activos de un usuario
     * GET /api/grupos-extras/usuario/{idUsuario}/activos
     */
    @GetMapping("/usuario/{idUsuario}/activos")
    public ResponseEntity<ApiResponseWrapper<List<GrupoExtra>>> obtenerGruposExtraActivos(@PathVariable Long idUsuario) {
        try {
            List<GrupoExtra> grupos = grupoExtraService.obtenerGruposExtraActivos(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, grupos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener grupos de extras por producto
     * GET /api/grupos-extras/producto/{idProducto}
     */
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<ApiResponseWrapper<List<GrupoExtra>>> obtenerGruposPorProducto(@PathVariable Long idProducto) {
        try {
            List<GrupoExtra> grupos = grupoExtraService.obtenerGruposPorProducto(idProducto);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, grupos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado activo de un grupo de extras
     * PUT /api/grupos-extras/{id}/estado?activo=true
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<GrupoExtra>> cambiarEstadoActivo(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        try {
            GrupoExtra grupo = grupoExtraService.cambiarEstadoActivo(id, activo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, grupo, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
