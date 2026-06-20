package com.api.apos.domain.receta;

import java.math.BigDecimal;
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

import com.api.apos.domain.receta.entity.Receta;
import com.api.apos.domain.receta.service.RecetaService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de recetas
 * Endpoints: /api/recetas
 */
@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
public class RecetaController {

    private final RecetaService recetaService;

    /**
     * Crear una nueva receta
     * POST /api/recetas
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Receta>> crearReceta(@RequestBody Receta receta) {
        try {
            Receta nuevaReceta = recetaService.crearReceta(receta);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaReceta, "Receta creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar una receta existente
     * PUT /api/recetas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Receta>> actualizarReceta(
            @PathVariable Long id,
            @RequestBody Receta receta) {
        try {
            Receta recetaActualizada = recetaService.actualizarReceta(id, receta);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaActualizada, "Receta actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar una receta (borrado lógico)
     * DELETE /api/recetas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarReceta(@PathVariable Long id) {
        try {
            recetaService.eliminarReceta(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Receta eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener una receta por ID
     * GET /api/recetas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Receta>> obtenerRecetaPorId(@PathVariable Long id) {
        return recetaService.obtenerRecetaPorId(id)
                .map(receta -> ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Receta no encontrada")));
    }

    /**
     * Obtener recetas activas de un usuario
     * GET /api/recetas/usuario/{idUsuario}/activas
     */
    @GetMapping("/usuario/activo/{idUsuario}")
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> obtenerRecetasActivas(@PathVariable Long idUsuario) {
        try {
            List<Receta> recetas = recetaService.obtenerRecetasActivas(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetas, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener recetas de un usuario autenticado
     * GET /api/recetas/usuario/
     */
    @GetMapping("/usuario")
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> obtenerRecetasByUsuarioAutenticado() {
        try {
            List<Receta> recetas = recetaService.obtenerRecetasByUsuarioAutenticado();
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetas, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Buscar recetas por término
     * GET /api/recetas/buscar?termino=xxx&idUsuario=1
     */
    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> buscarRecetas(
            @RequestParam String termino,
            @RequestParam Long idUsuario) {
        try {
            List<Receta> recetas = recetaService.buscarRecetas(idUsuario, termino);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetas, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Calcular costo de una receta
     * GET /api/recetas/{id}/costo
     */
    @GetMapping("/{id}/costo")
    public ResponseEntity<ApiResponseWrapper<BigDecimal>> calcularCostoReceta(@PathVariable Long id) {
        try {
            BigDecimal costo = recetaService.calcularCostoReceta(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, costo, "Costo calculado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Recalcular y actualizar el costo total de una receta
     * PUT /api/recetas/{id}/recalcular-costo
     */
    @PutMapping("/{id}/recalcular-costo")
    public ResponseEntity<ApiResponseWrapper<Receta>> recalcularCostoTotal(@PathVariable Long id) {
        try {
            Receta receta = recetaService.recalcularCostoTotal(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, "Costo recalculado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Verificar disponibilidad de materiales de una receta
     * GET /api/recetas/{id}/verificar-disponibilidad
     */
    @GetMapping("/{id}/verificar-disponibilidad")
    public ResponseEntity<ApiResponseWrapper<Boolean>> verificarDisponibilidadMateriales(@PathVariable Long id) {
        try {
            boolean disponible = recetaService.verificarDisponibilidadMateriales(id);
            String mensaje = disponible ? "Todos los materiales están disponibles" : "Algunos materiales no están disponibles";
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, disponible, mensaje));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
