package com.api.apos.domain.categoria;

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

import com.api.apos.domain.categoria.entity.Categoria;
import com.api.apos.domain.categoria.service.CategoriaService;
import com.api.apos.domain.producto.Producto;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

/**
 * Controller REST para gestión de categorías de productos
 * Endpoints: /api/categorias
 */
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    /**
     * Crear una nueva categoría
     * POST /api/categorias
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Categoria>> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria nuevaCategoria = categoriaService.crearCategoria(categoria);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaCategoria, "Categoría creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Actualizar una categoría existente
     * PUT /api/categorias/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Categoria>> actualizarCategoria(
            @PathVariable Long id,
            @RequestBody Categoria categoria) {
        try {
            Categoria categoriaActualizada = categoriaService.actualizarCategoria(id, categoria);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, categoriaActualizada, "Categoría actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Eliminar una categoría (borrado lógico)
     * DELETE /api/categorias/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Categoría eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener una categoría por ID
     * GET /api/categorias/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Categoria>> obtenerCategoriaPorId(@PathVariable Long id) {
        return categoriaService.obtenerCategoriaPorId(id)
                .map(categoria -> ResponseEntity.ok(new ApiResponseWrapper<>(true, categoria, null)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseWrapper<>(false, null, "Categoría no encontrada")));
    }

    /**
     * Obtener categorías de un usuario
     * GET /api/categorias/usuario/{idUsuario}
     */
    @GetMapping("/usuario")
    public ResponseEntity<ApiResponseWrapper<List<Categoria>>> obtenerCategoriasPorUsuario() {
        try {
            List<Categoria> categorias = categoriaService.obtenerCategoriasPorUsuario();
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, categorias, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener categorías activas de un usuario
     * GET /api/categorias/usuario/{idUsuario}/activas
     */
    @GetMapping("/usuario/{idUsuario}/activas")
    public ResponseEntity<ApiResponseWrapper<List<Categoria>>> obtenerCategoriasActivas(@PathVariable Long idUsuario) {
        try {
            List<Categoria> categorias = categoriaService.obtenerCategoriasActivas(idUsuario);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, categorias, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener productos de una categoría
     * GET /api/categorias/{id}/productos
     */
    @GetMapping("/{id}/productos")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> obtenerProductosPorCategoria(@PathVariable Long id) {
        try {
            List<Producto> productos = categoriaService.obtenerProductosPorCategoria(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Cambiar estado activo de una categoría
     * PUT /api/categorias/{id}/estado?activo=true
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Categoria>> cambiarEstadoActivo(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        try {
            Categoria categoria = categoriaService.cambiarEstadoActivo(id, activo);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, categoria, "Estado actualizado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

}
