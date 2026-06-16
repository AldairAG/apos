package com.api.apos.domain.producto;

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

import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de productos
 * Endpoints: /api/productos
 */
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    /**
     * Crear un nuevo producto
     * POST /api/productos
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Producto>> crearProducto(@RequestBody Producto producto) {
        try {
            Producto nuevoProducto = productoService.crearProducto(producto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevoProducto, "Producto creado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar un producto existente
     * PUT /api/productos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Producto>> actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto producto) {
        try {
            Producto productoActualizado = productoService.actualizarProducto(id, producto);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productoActualizado, "Producto actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar un producto (borrado lógico)
     * DELETE /api/productos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Producto eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener un producto por ID
     * GET /api/productos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Producto>> obtenerProductoPorId(@PathVariable Long id) {
        return productoService.obtenerProductoPorId(id)
                .map(producto -> ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Producto no encontrado")));
    }

    /**
     * Obtener productos por sucursal
     * GET /api/productos/sucursal/{idSucursal}
     */
    @GetMapping("/sucursal/{idSucursal}")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> obtenerProductosPorSucursal(@PathVariable Long idSucursal) {
        try {
            List<Producto> productos = productoService.obtenerProductosPorSucursal(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener productos activos de una sucursal
     * GET /api/productos/sucursal/{idSucursal}/activos
     */
    @GetMapping("/sucursal/{idSucursal}/activos")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> obtenerProductosActivos(@PathVariable Long idSucursal) {
        try {
            List<Producto> productos = productoService.obtenerProductosActivos(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Buscar productos por término
     * GET /api/productos/buscar?termino=xxx&idSucursal=1
     */
    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> buscarProductos(
            @RequestParam String termino,
            @RequestParam Long idSucursal) {
        try {
            List<Producto> productos = productoService.buscarProductos(idSucursal, termino);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener producto por código
     * GET /api/productos/codigo/{codigo}
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponseWrapper<Producto>> obtenerProductoPorCodigo(@PathVariable String codigo) {
        return productoService.obtenerProductoPorCodigo(codigo)
                .map(producto -> ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Producto no encontrado")));
    }

    /**
     * Obtener producto por SKU
     * GET /api/productos/sku/{sku}
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponseWrapper<Producto>> obtenerProductoPorSku(@PathVariable String sku) {
        return productoService.obtenerProductoPorSku(sku)
                .map(producto -> ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Producto no encontrado")));
    }

    /**
     * Obtener productos por categoría
     * GET /api/productos/categoria/{idCategoria}
     */
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> obtenerProductosPorCategoria(@PathVariable Long idCategoria) {
        try {
            List<Producto> productos = productoService.obtenerProductosPorCategoria(idCategoria);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener productos destacados
     * GET /api/productos/sucursal/{idSucursal}/destacados
     */
    @GetMapping("/sucursal/{idSucursal}/destacados")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> obtenerProductosDestacados(@PathVariable Long idSucursal) {
        try {
            List<Producto> productos = productoService.obtenerProductosDestacados(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado activo
     * PUT /api/productos/{id}/estado?activo=true
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Producto>> cambiarEstadoActivo(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        try {
            Producto producto = productoService.cambiarEstadoActivo(id, activo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado agotado
     * PUT /api/productos/{id}/agotado?agotado=true
     */
    @PutMapping("/{id}/agotado")
    public ResponseEntity<ApiResponseWrapper<Producto>> cambiarEstadoAgotado(
            @PathVariable Long id,
            @RequestParam boolean agotado) {
        try {
            Producto producto = productoService.cambiarEstadoAgotado(id, agotado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, "Estado de disponibilidad actualizado"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado destacado
     * PUT /api/productos/{id}/destacado?destacado=true
     */
    @PutMapping("/{id}/destacado")
    public ResponseEntity<ApiResponseWrapper<Producto>> cambiarEstadoDestacado(
            @PathVariable Long id,
            @RequestParam boolean destacado) {
        try {
            Producto producto = productoService.cambiarEstadoDestacado(id, destacado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, "Estado destacado actualizado"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar precio
     * PUT /api/productos/{id}/precio?precio=99.99
     */
    @PutMapping("/{id}/precio")
    public ResponseEntity<ApiResponseWrapper<Producto>> actualizarPrecio(
            @PathVariable Long id,
            @RequestParam Float precio) {
        try {
            Producto producto = productoService.actualizarPrecio(id, precio);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, "Precio actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar orden de visualización
     * PUT /api/productos/{id}/orden?orden=1
     */
    @PutMapping("/{id}/orden")
    public ResponseEntity<ApiResponseWrapper<Producto>> actualizarOrden(
            @PathVariable Long id,
            @RequestParam Integer orden) {
        try {
            Producto producto = productoService.actualizarOrden(id, orden);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, producto, "Orden actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
