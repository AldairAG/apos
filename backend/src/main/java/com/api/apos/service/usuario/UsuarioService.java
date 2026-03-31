package com.api.apos.service.usuario;

import com.api.apos.dto.AuthResponse;
import com.api.apos.dto.LoginRequest;
import com.api.apos.dto.RegisterRequest;
import com.api.apos.entity.Usuario;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Optional;

public interface UsuarioService extends UserDetailsService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    List<Usuario> findAll();
    Optional<Usuario> findById(Long id);
    Usuario update(Long id, Usuario usuario);
    void deleteById(Long id);
}
