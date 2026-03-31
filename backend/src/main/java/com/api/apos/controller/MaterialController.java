package com.api.apos.controller;

import com.api.apos.entity.Material;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.material.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiales")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Material>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, materialService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Material>> findById(@PathVariable Long id) {
        return materialService.findById(id)
                .map(m -> ResponseEntity.ok(new ApiResponseWrapper<>(true, m, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inventario/{inventarioId}")
    public ResponseEntity<ApiResponseWrapper<List<Material>>> findByInventarioId(@PathVariable Long inventarioId) {
        return ResponseEntity
                .ok(new ApiResponseWrapper<>(true, materialService.findByInventarioId(inventarioId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Material>> save(@RequestBody Material material) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, materialService.save(material), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Material>> update(@PathVariable Long id, @RequestBody Material material) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, materialService.update(id, material), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        materialService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
