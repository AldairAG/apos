package com.api.apos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.dto.request.CrearSucursalRequest;
import com.api.apos.dto.response.SucursalDto;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.sucursal.SucursalServiceImpl;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    @Autowired
    private SucursalServiceImpl sucursalService;

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseWrapper<SucursalDto>> crearSucursal(
            @PathVariable Long usuarioId,
            @RequestBody CrearSucursalRequest request) {
        try {
            if (request.getNombre() == null || request.getNombre().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponseWrapper<>(false, null, "El nombre de la sucursal es requerido"));
            }

            if (request.getDireccion() == null || request.getDireccion().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponseWrapper<>(false, null, "La dirección de la sucursal es requerida"));
            }

            SucursalDto sucursalCreada = sucursalService.crearSucursalParaUsuario(usuarioId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, sucursalCreada, "Sucursal creada exitosamente"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponseWrapper<>(false, null, "Error al crear la sucursal: " + e.getMessage()));
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseWrapper<List<SucursalDto>>> obtenerSucursalesPorUsuario(
            @PathVariable Long usuarioId) {
        try {
            List<SucursalDto> sucursales = sucursalService.obtenerSucursalesPorUsuarioId(usuarioId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursales, null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponseWrapper<>(false, null, "Error al obtener las sucursales: " + e.getMessage()));
        }
    }
}
