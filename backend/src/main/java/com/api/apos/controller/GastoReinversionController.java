package com.api.apos.controller;

import com.api.apos.entity.GastoReinversion;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.gastoreinversion.GastoReinversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos-reinversion")
@RequiredArgsConstructor
public class GastoReinversionController {

    private final GastoReinversionService gastoReinversionService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<GastoReinversion>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoReinversionService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<GastoReinversion>> findById(@PathVariable Long id) {
        return gastoReinversionService.findById(id)
                .map(g -> ResponseEntity.ok(new ApiResponseWrapper<>(true, g, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<GastoReinversion>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoReinversionService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<GastoReinversion>> save(@RequestBody GastoReinversion gastoReinversion) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoReinversionService.save(gastoReinversion), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<GastoReinversion>> update(@PathVariable Long id, @RequestBody GastoReinversion gastoReinversion) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, gastoReinversionService.update(id, gastoReinversion), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        gastoReinversionService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
