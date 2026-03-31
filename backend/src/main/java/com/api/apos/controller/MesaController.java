package com.api.apos.controller;

import com.api.apos.entity.Mesa;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.mesa.MesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Mesa>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> findById(@PathVariable Long id) {
        return mesaService.findById(id)
                .map(m -> ResponseEntity.ok(new ApiResponseWrapper<>(true, m, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Mesa>>> findBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaService.findBySucursalId(sucursalId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<Mesa>> save(@RequestBody Mesa mesa) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaService.save(mesa), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> update(@PathVariable Long id, @RequestBody Mesa mesa) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaService.update(id, mesa), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        mesaService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
