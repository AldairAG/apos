package com.api.apos.domain.orden;

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

import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.service.DetalleOrdenService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de detalles de orden
 * Endpoints: /api/detalles-orden
 */
@RestController
@RequestMapping("/api/detalles-orden")
@RequiredArgsConstructor
public class DetalleOrdenController {

    private final DetalleOrdenService detalleOrdenService;

    /**
     * Agregar un detalle a una orden
     * POST /api/detalles-orden
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> agregarDetalleOrden(@RequestBody DetalleOrden detalleOrden) {
        try {
            DetalleOrden nuevoDetalle = detalleOrdenService.agregarDetalleOrden(detalleOrden);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevoDetalle, "Detalle agregado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar un detalle de orden
     * PUT /api/detalles-orden/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> actualizarDetalleOrden(
            @PathVariable Long id,
            @RequestBody DetalleOrden detalleOrden) {
        try {
            DetalleOrden detalleActualizado = detalleOrdenService.actualizarDetalleOrden(id, detalleOrden);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalleActualizado, "Detalle actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar un detalle de orden
     * DELETE /api/detalles-orden/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarDetalleOrden(@PathVariable Long id) {
        try {
            detalleOrdenService.eliminarDetalleOrden(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Detalle eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener un detalle por ID
     * GET /api/detalles-orden/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> obtenerDetalleOrdenPorId(@PathVariable Long id) {
        return detalleOrdenService.obtenerDetalleOrdenPorId(id)
                .map(detalle -> ResponseEntity.ok(new ApiResponseWrapper<>(true, detalle, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Detalle de orden no encontrado")));
    }

    /**
     * Obtener detalles por orden
     * GET /api/detalles-orden/orden/{idOrden}
     */
    @GetMapping("/orden/{idOrden}")
    public ResponseEntity<ApiResponseWrapper<List<DetalleOrden>>> obtenerDetallesPorOrden(@PathVariable Long idOrden) {
        try {
            List<DetalleOrden> detalles = detalleOrdenService.obtenerDetallesPorOrden(idOrden);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalles, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener detalles por producto
     * GET /api/detalles-orden/producto/{idProducto}
     */
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<ApiResponseWrapper<List<DetalleOrden>>> obtenerDetallesPorProducto(@PathVariable Long idProducto) {
        try {
            List<DetalleOrden> detalles = detalleOrdenService.obtenerDetallesPorProducto(idProducto);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalles, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar cantidad de un detalle
     * PUT /api/detalles-orden/{id}/cantidad?cantidad=5
     */
    @PutMapping("/{id}/cantidad")
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> actualizarCantidad(
            @PathVariable Long id,
            @RequestParam Integer cantidad) {
        try {
            DetalleOrden detalle = detalleOrdenService.actualizarCantidad(id, cantidad);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalle, "Cantidad actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Recalcular subtotal de un detalle
     * PUT /api/detalles-orden/{id}/calcular-subtotal
     */
    @PutMapping("/{id}/calcular-subtotal")
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> calcularSubtotal(@PathVariable Long id) {
        try {
            DetalleOrden detalle = detalleOrdenService.calcularSubtotal(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalle, "Subtotal calculado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Calcular total incluyendo extras
     * GET /api/detalles-orden/{id}/total
     */
    @GetMapping("/{id}/total")
    public ResponseEntity<ApiResponseWrapper<BigDecimal>> calcularTotalDetalle(@PathVariable Long id) {
        try {
            BigDecimal total = detalleOrdenService.calcularTotalDetalle(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, total, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Agregar un extra a un detalle
     * POST /api/detalles-orden/{idDetalle}/extras?idOpcionExtra=1
     */
    @PostMapping("/{idDetalle}/extras")
    public ResponseEntity<ApiResponseWrapper<DetalleOrden>> agregarExtra(
            @PathVariable Long idDetalle,
            @RequestParam Long idOpcionExtra) {
        try {
            DetalleOrden detalle = detalleOrdenService.agregarExtra(idDetalle, idOpcionExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, detalle, "Extra agregado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar un extra de un detalle
     * DELETE /api/detalles-orden/{idDetalle}/extras/{idDetalleOrdenExtra}
     */
    @DeleteMapping("/{idDetalle}/extras/{idDetalleOrdenExtra}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarExtra(
            @PathVariable Long idDetalle,
            @PathVariable Long idDetalleOrdenExtra) {
        try {
            detalleOrdenService.eliminarExtra(idDetalle, idDetalleOrdenExtra);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Extra eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
