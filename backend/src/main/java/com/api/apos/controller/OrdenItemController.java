package com.api.apos.controller;

import com.api.apos.entity.OrdenItem;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.ordenitem.OrdenItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orden-items")
@RequiredArgsConstructor
public class OrdenItemController {

    private final OrdenItemService ordenItemService;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<OrdenItem>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenItemService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<OrdenItem>> findById(@PathVariable Long id) {
        return ordenItemService.findById(id)
                .map(o -> ResponseEntity.ok(new ApiResponseWrapper<>(true, o, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orden/{ordenId}")
    public ResponseEntity<ApiResponseWrapper<List<OrdenItem>>> findByOrdenId(@PathVariable Long ordenId) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenItemService.findByOrdenId(ordenId), null));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<OrdenItem>> save(@RequestBody OrdenItem ordenItem) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenItemService.save(ordenItem), null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<OrdenItem>> update(@PathVariable Long id,
            @RequestBody OrdenItem ordenItem) {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenItemService.update(id, ordenItem), null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        ordenItemService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
