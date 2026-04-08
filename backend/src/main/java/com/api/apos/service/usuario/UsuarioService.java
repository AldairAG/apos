package com.api.apos.service.usuario;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.api.apos.dto.response.JwtResponse;

public interface UsuarioService extends UserDetailsService {
    JwtResponse registrarUsuario(String email,String password);

    JwtResponse login(String email, String password);
}
