package com.api.apos.aplication.usuario.usecase;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.dto.request.AuthRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;
import com.api.apos.helpers.JwtHelper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarUsuarioUseCase {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtHelper jwtHelper;


    @Transactional
    public JwtResponse execute(AuthRequest request) {
        // Validar si el usuario ya existe
        if (usuarioService.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USUARIO_CORREO_YA_EXISTE);
        }

        // Crear nuevo usuario
        Usuario nuevoUsuario = Usuario.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .telefono(request.getTelefono())
                .nombre(request.getNombre() + " " + request.getApellido())
                .lada(request.getLada())
                .rol(request.getRol()) // Por defecto, asignar rol ADMINISTRADOR
                .fechaRegistro(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        // Guardar usuario
        Usuario usuarioGuardado = usuarioService.save(nuevoUsuario);

        // Generar token JWT
        String token = jwtHelper.generateToken(usuarioGuardado);

        return new JwtResponse(token, usuarioGuardado.getId(), usuarioGuardado.getEmail());
    }

}
