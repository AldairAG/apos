package com.api.apos.controller;

import com.api.apos.entity.Entrada;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.entrada.EntradaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entradas")
@RequiredArgsConstructor
public class EntradaController {

    private final EntradaService entradaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Entrada>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, entradaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Entrada>> findById(@PathVariable Long id) {
        return entradaService.findById(id)
                .map(e -> ResponseEntity.ok(new ApiResponseWrapper<>(true, e, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Entrada>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, entradaService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Entrada>> save(@RequestBody Entrada entrada) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, entradaService.save(entrada), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Entrada>> update(@PathVariable Long id, @RequestBody Entrada entrada) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, entradaService.update(id, entrada), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        entradaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
