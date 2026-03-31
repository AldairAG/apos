package com.api.apos.controller;

import com.api.apos.entity.Gasto;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.gasto.GastoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@RequiredArgsConstructor
public class GastoController {

    private final GastoService gastoService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Gasto>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Gasto>> findById(@PathVariable Long id) {
        return gastoService.findById(id)
                .map(g -> ResponseEntity.ok(new ApiResponseWrapper<>(true, g, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Gasto>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Gasto>> save(@RequestBody Gasto gasto) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoService.save(gasto), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Gasto>> update(@PathVariable Long id, @RequestBody Gasto gasto) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoService.update(id, gasto), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        gastoService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
