package com.api.apos.service.usuario;

import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.dto.response.JwtResponse;
import com.api.apos.entity.Usuario;
import com.api.apos.helpers.JwtHelper;
import com.api.apos.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtHelper jwtHelper;

    @Lazy
    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    @Override
    public JwtResponse registrarUsuario(String email, String password) {
        usuarioRepository.findByEmail(email).ifPresent(
                usuario -> {
                    throw new IllegalArgumentException("El email ya está registrado: " + email);
                });

        // Aquí se debería encriptar la contraseña antes de guardar
        String encodedPassword = passwordEncoder.encode(password);

        Usuario nuevoUsuario = Usuario.builder()
                .email(email)
                .password(encodedPassword)
                .activo(true)
                .rol(com.api.apos.enums.Rol.ADMINISTRADOR) // Asignar un rol por defecto
                .build();

        usuarioRepository.save(nuevoUsuario);

        return login(email, password);

    }

    @Transactional
    public JwtResponse login(String email, String password) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException(
                            "Usuario no encontrado con email: " + email));

            // Autenticar usuario con contraseña normal
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            password));

            // Obtener usuario autenticado
            usuario = (Usuario) authentication.getPrincipal();

            // Generar token JWT
            String token = jwtHelper.generateToken(usuario);

            // Crear respuesta
            return new JwtResponse(
                    token,
                    usuario.getId(),
                    usuario.getEmail());

        } catch (AuthenticationException e) {
            throw new RuntimeException("Ocurrió un error durante la autenticación: " + e.getMessage(), e);
        }
    }

}
