package com.api.apos.controller;

import com.api.apos.entity.CategoriaGasto;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.categoriagasto.CategoriaGastoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-gasto")
@RequiredArgsConstructor
public class CategoriaGastoController {

    private final CategoriaGastoService categoriaGastoService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<CategoriaGasto>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, categoriaGastoService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<CategoriaGasto>> findById(@PathVariable Long id) {
        return categoriaGastoService.findById(id)
                .map(c -> ResponseEntity.ok(new ApiResponseWrapper<>(true, c, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<CategoriaGasto>> save(@RequestBody CategoriaGasto categoriaGasto) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, categoriaGastoService.save(categoriaGasto), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<CategoriaGasto>> update(@PathVariable Long id,
            @RequestBody CategoriaGasto categoriaGasto) {
        return ResponseEntity
                .ok(new ApiResponseWrapper<>(true, categoriaGastoService.update(id, categoriaGasto), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        categoriaGastoService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
