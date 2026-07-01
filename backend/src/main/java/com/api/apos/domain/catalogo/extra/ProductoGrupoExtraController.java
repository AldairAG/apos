package com.api.apos.domain.catalogo.extra;

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
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.catalogo.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.catalogo.extra.service.ProductoGrupoExtraService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de relaciones producto-grupo de extras
 * Endpoints: /api/producto-grupo-extra
 */
@RestController
@RequestMapping("/api/producto-grupo-extra")
@RequiredArgsConstructor
public class ProductoGrupoExtraController {

    private final ProductoGrupoExtraService productoGrupoExtraService;

    /**
     * Crear una nueva relación producto-grupo extra
     * POST /api/producto-grupo-extra
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<ProductoGrupoExtra>> crearProductoGrupoExtra(@RequestBody ProductoGrupoExtra productoGrupoExtra) {
        try {
            ProductoGrupoExtra nuevaRelacion = productoGrupoExtraService.crearProductoGrupoExtra(productoGrupoExtra);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaRelacion, "Relación creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar una relación existente
     * PUT /api/producto-grupo-extra/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<ProductoGrupoExtra>> actualizarProductoGrupoExtra(
            @PathVariable Long id,
            @RequestBody ProductoGrupoExtra productoGrupoExtra) {
        try {
            ProductoGrupoExtra relacionActualizada = productoGrupoExtraService.actualizarProductoGrupoExtra(id, productoGrupoExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, relacionActualizada, "Relación actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar una relación
     * DELETE /api/producto-grupo-extra/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarProductoGrupoExtra(@PathVariable Long id) {
        try {
            productoGrupoExtraService.eliminarProductoGrupoExtra(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Relación eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener una relación por ID
     * GET /api/producto-grupo-extra/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<ProductoGrupoExtra>> obtenerProductoGrupoExtraPorId(@PathVariable Long id) {
        return productoGrupoExtraService.obtenerProductoGrupoExtraPorId(id)
                .map(relacion -> ResponseEntity.ok(new ApiResponseWrapper<>(true, relacion, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Relación no encontrada")));
    }

    /**
     * Obtener grupos de extras por producto
     * GET /api/producto-grupo-extra/producto/{idProducto}
     */
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<ApiResponseWrapper<List<ProductoGrupoExtra>>> obtenerGruposPorProducto(@PathVariable Long idProducto) {
        try {
            List<ProductoGrupoExtra> relaciones = productoGrupoExtraService.obtenerGruposPorProducto(idProducto);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, relaciones, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener productos por grupo de extras
     * GET /api/producto-grupo-extra/grupo/{idGrupoExtra}
     */
    @GetMapping("/grupo/{idGrupoExtra}")
    public ResponseEntity<ApiResponseWrapper<List<ProductoGrupoExtra>>> obtenerProductosPorGrupo(@PathVariable Long idGrupoExtra) {
        try {
            List<ProductoGrupoExtra> relaciones = productoGrupoExtraService.obtenerProductosPorGrupo(idGrupoExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, relaciones, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar todos los grupos de extras de un producto
     * DELETE /api/producto-grupo-extra/producto/{idProducto}
     */
    @DeleteMapping("/producto/{idProducto}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarGruposPorProducto(@PathVariable Long idProducto) {
        try {
            productoGrupoExtraService.eliminarGruposPorProducto(idProducto);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Todos los grupos eliminados exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
