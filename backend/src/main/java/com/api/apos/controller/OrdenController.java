package com.api.apos.controller;

import com.api.apos.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.orden.OrdenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Orden>> findById(@PathVariable Long id) {
        return ordenService.findById(id)
                .map(o -> ResponseEntity.ok(new ApiResponseWrapper<>(true, o, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.findBySucursalId(sucursalId), null));
    }

    @GetMapping("/mesa/{mesaId}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> findByMesaId(@PathVariable Long mesaId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.findByMesaId(mesaId), null));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> findByEstado(@PathVariable EstadoOrden estado) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.findByEstado(estado), null));
    }

    @GetMapping("/sucursal/{sucursalId}/estado/{estado}")
    public ResponseEntity<ApiResponseWrapper<List<Orden>>> findBySucursalIdAndEstado(
            @PathVariable Long sucursalId, @PathVariable EstadoOrden estado) {
        return ResponseEntity
                .ok(new ApiResponseWrapper<>(true, ordenService.findBySucursalIdAndEstado(sucursalId, estado), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Orden>> save(@RequestBody Orden orden) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.save(orden), null));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Orden>> updateEstado(@PathVariable Long id,
            @RequestParam EstadoOrden estado) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenService.updateEstado(id, estado), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        ordenService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
