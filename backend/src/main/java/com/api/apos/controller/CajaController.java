package com.api.apos.controller;

import com.api.apos.entity.Caja;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.caja.CajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cajas")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Caja>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Caja>> findById(@PathVariable Long id) {
        return cajaService.findById(id)
                .map(c -> ResponseEntity.ok(new ApiResponseWrapper<>(true, c, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Caja>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Caja>> save(@RequestBody Caja caja) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaService.save(caja), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Caja>> update(@PathVariable Long id, @RequestBody Caja caja) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaService.update(id, caja), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        cajaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
