package com.api.apos.domain.usuario.service;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.api.apos.domain.usuario.Usuario;
import com.api.apos.domain.usuario.dto.ColaboradorDTO;
import com.api.apos.dto.response.JwtResponse;

public interface UsuarioService extends UserDetailsService {

    JwtResponse registrarUsuario(String email,String password);

    JwtResponse login(String email, String password);

    Usuario obtenerUsuarioAutenticado();
    
    ColaboradorDTO agregarColaborador(ColaboradorDTO colaboradorDTO);

    void eliminarColaborador(Long id);

    Usuario obtenerColaboradorPorId(Long id);

    Usuario actualizarColaborador(Long id, ColaboradorDTO colaboradorDTO);

    
    
}
