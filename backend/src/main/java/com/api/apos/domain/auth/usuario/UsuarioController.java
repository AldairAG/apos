package com.api.apos.domain.auth.usuario;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.auth.usuario.service.UsuarioService;
import com.api.apos.dto.request.AuthRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.helpers.ApiResponseWrapper;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

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

    


}
