package com.api.apos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.dto.request.CrearReceta;
import com.api.apos.entity.Receta;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.receta.RecetaService;

@RestController
@RequestMapping("/api/recetas")
public class RecetaController {
    
    @Autowired
    private RecetaService recetaService;

    // ==================== RECETAS ====================

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> obtenerRecetasPorSucursal(
            @PathVariable Long sucursalId) {
        try {
            List<Receta> recetas = recetaService.obtenerRecetasPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetas, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/sucursal/{sucursalId}/activas")
    public ResponseEntity<ApiResponseWrapper<List<Receta>>> obtenerRecetasActivasPorSucursal(
            @PathVariable Long sucursalId) {
        try {
            List<Receta> recetas = recetaService.obtenerRecetasActivasPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, recetas, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/{recetaId}")
    public ResponseEntity<ApiResponseWrapper<Receta>> obtenerRecetaPorId(
            @PathVariable Long recetaId) {
        try {
            Receta receta = recetaService.obtenerRecetaPorId(recetaId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PostMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Receta>> crearReceta(
            @PathVariable Long sucursalId,
            @RequestBody CrearReceta request) {
        try {
            Receta receta = recetaService.crearReceta(sucursalId, request);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{recetaId}")
    public ResponseEntity<ApiResponseWrapper<Receta>> actualizarReceta(
            @PathVariable Long recetaId,
            @RequestBody CrearReceta request) {
        try {
            Receta receta = recetaService.actualizarReceta(recetaId, request);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/{recetaId}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarReceta(
            @PathVariable Long recetaId) {
        try {
            recetaService.eliminarReceta(recetaId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Receta eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PatchMapping("/{recetaId}/estado")
    public ResponseEntity<ApiResponseWrapper<Receta>> activarDesactivarReceta(
            @PathVariable Long recetaId,
            @RequestParam Boolean activa) {
        try {
            Receta receta = recetaService.activarDesactivarReceta(recetaId, activa);
            String mensaje = activa ? "Receta activada exitosamente" : "Receta desactivada exitosamente";
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, receta, mensaje));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
