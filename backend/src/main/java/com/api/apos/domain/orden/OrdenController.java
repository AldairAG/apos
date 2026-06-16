package com.api.apos.domain.orden;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de órdenes del POS
 * Endpoints: /api/ordenes
 */
@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    /**
     * Crear una nueva orden
     * POST /api/ordenes
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Orden>> crearOrden(@RequestBody Orden orden) {
        try {
            Orden nuevaOrden = ordenService.crearOrden(orden);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaOrden, "Orden creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar una orden existente
     * PUT /api/ordenes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Orden>> actualizarOrden(
            @PathVariable Long id,
            @RequestBody Orden orden) {
        try {
            Orden ordenActualizada = ordenService.actualizarOrden(id, orden);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenActualizada, "Orden actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cancelar una orden
     * PATCH /api/ordenes/{id}/cancelar?motivo=xxx
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponseWrapper<Void>> cancelarOrden(
            @PathVariable Long id,
            @RequestParam String motivo) {
        try {
            ordenService.cancelarOrden(id, motivo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Orden cancelada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener una orden por ID
     * GET /api/ordenes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Orden>> obtenerOrdenPorId(@PathVariable Long id) {
        return ordenService.obtenerOrdenPorId(id)
                .map(orden -> ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Orden no encontrada")));
    }

    /**
     * Obtener orden por folio
     * GET /api/ordenes/folio/{folio}
     */
    @GetMapping("/folio/{folio}")
    public ResponseEntity<ApiResponseWrapper<Orden>> obtenerOrdenPorFolio(@PathVariable String folio) {
        return ordenService.obtenerOrdenPorFolio(folio)
                .map(orden -> ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Orden no encontrada")));
    }

    /**
     * Obtener órdenes por sucursal
     * GET /api/ordenes/sucursal/{idSucursal}
     */
    @GetMapping("/sucursal/{idSucursal}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesPorSucursal(@PathVariable Long idSucursal) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesPorSucursal(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes por estado
     * GET /api/ordenes/sucursal/{idSucursal}/estado/{estado}
     */
    @GetMapping("/sucursal/{idSucursal}/estado/{estado}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesPorEstado(
            @PathVariable Long idSucursal,
            @PathVariable EstadoOrden estado) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesPorEstado(idSucursal, estado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes por tipo
     * GET /api/ordenes/sucursal/{idSucursal}/tipo/{tipo}
     */
    @GetMapping("/sucursal/{idSucursal}/tipo/{tipo}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesPorTipo(
            @PathVariable Long idSucursal,
            @PathVariable TipoOrden tipo) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesPorTipo(idSucursal, tipo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes de una mesa
     * GET /api/ordenes/mesa/{idMesa}
     */
    @GetMapping("/mesa/{idMesa}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesPorMesa(@PathVariable Long idMesa) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesPorMesa(idMesa);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes del día
     * GET /api/ordenes/sucursal/{idSucursal}/dia?fecha=2024-01-01
     */
    @GetMapping("/sucursal/{idSucursal}/dia")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesDelDia(
            @PathVariable Long idSucursal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesDelDia(idSucursal, fecha);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes en rango de fechas
     * GET /api/ordenes/sucursal/{idSucursal}/rango?inicio=2024-01-01T00:00:00&fin=2024-01-31T23:59:59
     */
    @GetMapping("/sucursal/{idSucursal}/rango")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesPorFecha(
            @PathVariable Long idSucursal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesPorFecha(idSucursal, inicio, fin);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes abiertas (monitor cocina)
     * GET /api/ordenes/sucursal/{idSucursal}/abiertas
     */
    @GetMapping("/sucursal/{idSucursal}/abiertas")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesAbiertas(@PathVariable Long idSucursal) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesAbiertas(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener órdenes activas
     * GET /api/ordenes/sucursal/{idSucursal}/activas
     */
    @GetMapping("/sucursal/{idSucursal}/activas")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> obtenerOrdenesActivas(@PathVariable Long idSucursal) {
        try {
            List<Orden> ordenes = ordenService.obtenerOrdenesActivas(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado de una orden
     * PUT /api/ordenes/{id}/estado?estado=EN_PREPARACION&idEmpleado=1
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Orden>> cambiarEstadoOrden(
            @PathVariable Long id,
            @RequestParam EstadoOrden estado,
            @RequestParam(required = false) Long idEmpleado) {
        try {
            Orden orden = ordenService.cambiarEstadoOrden(id, estado, idEmpleado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Aplicar descuento
     * PUT /api/ordenes/{id}/descuento?descuento=10.50
     */
    @PutMapping("/{id}/descuento")
    public ResponseEntity<ApiResponseWrapper<Orden>> aplicarDescuento(
            @PathVariable Long id,
            @RequestParam BigDecimal descuento) {
        try {
            Orden orden = ordenService.aplicarDescuento(id, descuento);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Descuento aplicado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Aplicar propina
     * PUT /api/ordenes/{id}/propina?propina=15.00
     */
    @PutMapping("/{id}/propina")
    public ResponseEntity<ApiResponseWrapper<Orden>> aplicarPropina(
            @PathVariable Long id,
            @RequestParam BigDecimal propina) {
        try {
            Orden orden = ordenService.aplicarPropina(id, propina);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Propina aplicada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Recalcular totales
     * PUT /api/ordenes/{id}/calcular-totales
     */
    @PutMapping("/{id}/calcular-totales")
    public ResponseEntity<ApiResponseWrapper<Orden>> calcularTotales(@PathVariable Long id) {
        try {
            Orden orden = ordenService.calcularTotales(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Totales calculados exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cerrar orden (marcar como LISTA)
     * PUT /api/ordenes/{id}/cerrar
     */
    @PutMapping("/{id}/cerrar")
    public ResponseEntity<ApiResponseWrapper<Orden>> cerrarOrden(@PathVariable Long id) {
        try {
            Orden orden = ordenService.cerrarOrden(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Orden cerrada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Completar orden (marcar como ENTREGADA)
     * PUT /api/ordenes/{id}/completar?idEmpleado=1
     */
    @PutMapping("/{id}/completar")
    public ResponseEntity<ApiResponseWrapper<Orden>> completarOrden(
            @PathVariable Long id,
            @RequestParam(required = false) Long idEmpleado) {
        try {
            Orden orden = ordenService.completarOrden(id, idEmpleado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, orden, "Orden completada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener total de una orden
     * GET /api/ordenes/{id}/total
     */
    @GetMapping("/{id}/total")
    public ResponseEntity<ApiResponseWrapper<BigDecimal>> calcularTotalOrden(@PathVariable Long id) {
        try {
            BigDecimal total = ordenService.calcularTotalOrden(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, total, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
