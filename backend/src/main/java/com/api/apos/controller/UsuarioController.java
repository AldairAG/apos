package com.api.apos.controller;

import com.api.apos.dto.AuthResponse;
import com.api.apos.dto.LoginRequest;
import com.api.apos.dto.RegisterRequest;
import com.api.apos.entity.Usuario;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.service.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponseWrapper<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse response = usuarioService.register(request);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseWrapper<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = usuarioService.login(request);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, null));
    }

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<List<Usuario>>> findAll() {
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, usuarioService.findAll(), null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Usuario>> findById(@PathVariable Long id) {
        return usuarioService.findById(id)
                .map(u -> ResponseEntity.ok(new ApiResponseWrapper<>(true, u, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Usuario>> update(@PathVariable Long id, @RequestBody Usuario usuario) {
        Usuario updated = usuarioService.update(id, usuario);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, updated, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> delete(@PathVariable Long id) {
        usuarioService.deleteById(id);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
    }
}
