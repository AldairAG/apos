package com.api.apos.controller;

import com.api.apos.entity.Sucursal;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.sucursal.SucursalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
public class SucursalController {

    private final SucursalService sucursalService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Sucursal>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursalService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Sucursal>> findById(@PathVariable Long id) {
        return sucursalService.findById(id)
                .map(s -> ResponseEntity.ok(new ApiResponseWrapper<>(true, s, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseWrapper<List<Sucursal>>> findByUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursalService.findByUsuarioId(usuarioId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Sucursal>> save(@RequestBody Sucursal sucursal) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursalService.save(sucursal), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Sucursal>> update(@PathVariable Long id, @RequestBody Sucursal sucursal) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursalService.update(id, sucursal), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        sucursalService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
