package com.api.apos.controller;

import com.api.apos.entity.RecetaMaterial;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.recetamaterial.RecetaMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receta-materiales")
@RequiredArgsConstructor
public class RecetaMaterialController {

    private final RecetaMaterialService recetaMaterialService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<RecetaMaterial>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaMaterialService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<RecetaMaterial>> findById(@PathVariable Long id) {
        return recetaMaterialService.findById(id)
                .map(r -> ResponseEntity.ok(new ApiResponseWrapper<>(true, r, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/receta/{recetaId}")
    public ResponseEntity<ApiResponseWrapper<List<RecetaMaterial>>> findByRecetaId(@PathVariable Long recetaId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaMaterialService.findByRecetaId(recetaId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<RecetaMaterial>> save(@RequestBody RecetaMaterial recetaMaterial) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetaMaterialService.save(recetaMaterial), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<RecetaMaterial>> update(@PathVariable Long id,
            @RequestBody RecetaMaterial recetaMaterial) {
        return ResponseEntity
                .ok(new ApiResponseWrapper<>(true, recetaMaterialService.update(id, recetaMaterial), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        recetaMaterialService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
