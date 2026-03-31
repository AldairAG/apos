package com.api.apos.controller;

import com.api.apos.entity.Inventario;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.inventario.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Inventario>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, inventarioService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Inventario>> findById(@PathVariable Long id) {
        return inventarioService.findById(id)
                .map(i -> ResponseEntity.ok(new ApiResponseWrapper<>(true, i, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Inventario>> findBySucursalId(@PathVariable Long sucursalId) {
        return inventarioService.findBySucursalId(sucursalId)
                .map(i -> ResponseEntity.ok(new ApiResponseWrapper<>(true, i, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Inventario>> save(@RequestBody Inventario inventario) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, inventarioService.save(inventario), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        inventarioService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
