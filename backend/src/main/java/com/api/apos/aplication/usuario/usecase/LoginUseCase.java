package com.api.apos.aplication.usuario.usecase;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;
import com.api.apos.helpers.JwtHelper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LoginUseCase {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtHelper jwtHelper;

    public JwtResponse execute(String email, String password) {

        if (email == null || password == null) {
            throw new AppException(ErrorCode.EMAIL_Y_PASSWORD_REQUERIDOS);
        }

        // Autenticar usuario
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        // Obtener usuario autenticado
        Usuario usuario = (Usuario) authentication.getPrincipal();

        // Actualizar último acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioService.save(usuario);

        // Generar token JWT
        String token = jwtHelper.generateToken(usuario);

        return new JwtResponse(token, usuario.getId(), usuario.getEmail());
    }

}
