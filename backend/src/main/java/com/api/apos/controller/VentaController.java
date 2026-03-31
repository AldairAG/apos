package com.api.apos.controller;

import com.api.apos.entity.Venta;
import com.api.apos.enums.EstadoVenta;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.venta.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Venta>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ventaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Venta>> findById(@PathVariable Long id) {
        return ventaService.findById(id)
                .map(v -> ResponseEntity.ok(new ApiResponseWrapper<>(true, v, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Venta>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ventaService.findBySucursalId(sucursalId), null));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseWrapper<List<Venta>>> findByEstado(@PathVariable EstadoVenta estado) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ventaService.findByEstado(estado), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Venta>> save(@RequestBody Venta venta) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ventaService.save(venta), null));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponseWrapper<Venta>> updateEstado(@PathVariable Long id,
            @RequestParam EstadoVenta estado) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ventaService.updateEstado(id, estado), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        ventaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
