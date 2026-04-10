package com.api.apos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.dto.request.AgregarItemRequest;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.inventario.InventarioService;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {
    
    @Autowired
    private InventarioService inventarioService;

    // ==================== INVENTARIO ====================

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Inventario>> obtenerInventarioPorSucursal(
            @PathVariable Long sucursalId) {
        try {
            Inventario inventario = inventarioService.obtenerInventarioPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, inventario, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    // ==================== INVENTARIO ITEMS (Materiales) ====================

    @PostMapping("/{inventarioId}/items")
    public ResponseEntity<ApiResponseWrapper<InventarioItem>> agregarItemInventario(
            @PathVariable Long inventarioId,
            @RequestBody AgregarItemRequest request) {
        try {
            InventarioItem item = inventarioService.agregarItemInventario(inventarioId, request);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, item, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponseWrapper<InventarioItem>> editarItemInventario(
            @PathVariable Long itemId,
            @RequestBody AgregarItemRequest request) {
        try {
            InventarioItem item = inventarioService.editarItemInventario(itemId, request);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, item, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarItemInventario(@PathVariable Long itemId) {
        try {
            inventarioService.eliminarItemInventario(itemId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/{inventarioId}/items")
    public ResponseEntity<ApiResponseWrapper<List<InventarioItem>>> obtenerItemsPorInventario(
            @PathVariable Long inventarioId) {
        try {
            List<InventarioItem> items = inventarioService.obtenerItemsPorInventario(inventarioId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, items, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/{inventarioId}/items/stock-bajo")
    public ResponseEntity<ApiResponseWrapper<List<InventarioItem>>> obtenerItemsConStockBajo(
            @PathVariable Long inventarioId) {
        try {
            List<InventarioItem> items = inventarioService.obtenerItemsConStockBajo(inventarioId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, items, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

}
