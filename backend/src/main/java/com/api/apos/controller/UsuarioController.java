package com.api.apos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.dto.request.AuthRequest;
import com.api.apos.dto.request.CrearSucursalRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.dto.response.SucursalDto;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.usuario.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<ApiResponseWrapper<JwtResponse>> registrar(@RequestBody AuthRequest request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponseWrapper<>(false, null, "Email y password son requeridos"));
            }

            JwtResponse response = usuarioService.registrarUsuario(email, password);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseWrapper<JwtResponse>> login(@RequestBody AuthRequest request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponseWrapper<>(false, null, "Email y password son requeridos"));
            }

            JwtResponse response = usuarioService.login(email, password);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/{usuarioId}/sucursales")
    public ResponseEntity<ApiResponseWrapper<List<SucursalDto>>> getSucursales(@PathVariable Long usuarioId) {
        try {
            List<SucursalDto> sucursales = usuarioService.getSucursalesByUsuarioId(usuarioId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursales, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PostMapping("/{usuarioId}/sucursales")
    public ResponseEntity<ApiResponseWrapper<CrearSucursalRequest>> crearSucursal(
            @PathVariable Long usuarioId,
            @RequestBody CrearSucursalRequest request) {
        try {
            CrearSucursalRequest resultado = usuarioService.crearSucursalParaUsuario(usuarioId, request);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, resultado, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/{usuarioId}/sucursales/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarSucursal(
            @PathVariable Long usuarioId,
            @PathVariable Long sucursalId) {
        try {
            usuarioService.eliminarSucursalDeUsuario(usuarioId, sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}
