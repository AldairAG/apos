package com.api.apos.controller;

import com.api.apos.entity.Producto;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.producto.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, productoService.findAll(), null));
    }

    @GetMapping("/activos")
    public ResponseEntity<ApiResponseWrapper<List<Producto>>> findActivos() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, productoService.findActivos(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Producto>> findById(@PathVariable Long id) {
        return productoService.findById(id)
                .map(p -> ResponseEntity.ok(new ApiResponseWrapper<>(true, p, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Producto>> save(@RequestBody Producto producto) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, productoService.save(producto), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Producto>> update(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, productoService.update(id, producto), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        productoService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
