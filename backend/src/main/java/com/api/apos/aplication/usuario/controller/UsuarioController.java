package com.api.apos.aplication.usuario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.usuario.usecase.LoginUseCase;
import com.api.apos.aplication.usuario.usecase.RegistrarUsuarioUseCase;
import com.api.apos.dto.request.AuthRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.exception.SuccessCode;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@AllArgsConstructor
public class UsuarioController {

    private final LoginUseCase loginUseCase;

    private final RegistrarUsuarioUseCase registrarUsuario;

    @PostMapping("/auth/registro")
    public ResponseEntity<ApiResponseWrapper<JwtResponse>> registrar(@RequestBody AuthRequest request) {
        JwtResponse response = registrarUsuario.execute(request);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, SuccessCode.REGISTRO_EXITOSO.name(), null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseWrapper<JwtResponse>> login(@RequestBody AuthRequest request) {
        JwtResponse response = loginUseCase.execute(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, response, SuccessCode.LOGIN_EXITOSO.name(), null));
    }

}
