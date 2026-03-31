package com.api.apos.controller;

import com.api.apos.entity.Salida;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.salida.SalidaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salidas")
@RequiredArgsConstructor
public class SalidaController {

    private final SalidaService salidaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Salida>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, salidaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Salida>> findById(@PathVariable Long id) {
        return salidaService.findById(id)
                .map(s -> ResponseEntity.ok(new ApiResponseWrapper<>(true, s, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Salida>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, salidaService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Salida>> save(@RequestBody Salida salida) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, salidaService.save(salida), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Salida>> update(@PathVariable Long id, @RequestBody Salida salida) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, salidaService.update(id, salida), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        salidaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
