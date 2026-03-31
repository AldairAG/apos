package com.api.apos.controller;

import com.api.apos.entity.CorteCaja;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.cortecaja.CorteCajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cortes-caja")
@RequiredArgsConstructor
public class CorteCajaController {

    private final CorteCajaService corteCajaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<CorteCaja>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, corteCajaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<CorteCaja>> findById(@PathVariable Long id) {
        return corteCajaService.findById(id)
                .map(c -> ResponseEntity.ok(new ApiResponseWrapper<>(true, c, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/caja/{cajaId}")
    public ResponseEntity<ApiResponseWrapper<List<CorteCaja>>> findByCajaId(@PathVariable Long cajaId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, corteCajaService.findByCajaId(cajaId), null));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseWrapper<List<CorteCaja>>> findByUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, corteCajaService.findByUsuarioId(usuarioId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<CorteCaja>> save(@RequestBody CorteCaja corteCaja) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, corteCajaService.save(corteCaja), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        corteCajaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
