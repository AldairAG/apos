package com.api.apos.controller;

import com.api.apos.entity.Silla;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.silla.SillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sillas")
@RequiredArgsConstructor
public class SillaController {

    private final SillaService sillaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Silla>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sillaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Silla>> findById(@PathVariable Long id) {
        return sillaService.findById(id)
                .map(s -> ResponseEntity.ok(new ApiResponseWrapper<>(true, s, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mesa/{mesaId}")
    public ResponseEntity<ApiResponseWrapper<List<Silla>>> findByMesaId(@PathVariable Long mesaId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sillaService.findByMesaId(mesaId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Silla>> save(@RequestBody Silla silla) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sillaService.save(silla), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Silla>> update(@PathVariable Long id, @RequestBody Silla silla) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sillaService.update(id, silla), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        sillaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
