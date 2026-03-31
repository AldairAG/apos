package com.api.apos.controller;

import com.api.apos.entity.Receta;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.receta.RecetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
public class RecetaController {

    private final RecetaService recetaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Receta>> findById(@PathVariable Long id) {
        return recetaService.findById(id)
                .map(r -> ResponseEntity.ok(new ApiResponseWrapper<>(true, r, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Receta>> save(@RequestBody Receta receta) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaService.save(receta), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Receta>> update(@PathVariable Long id, @RequestBody Receta receta) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaService.update(id, receta), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        recetaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
