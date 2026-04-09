package com.api.apos.service.usuario;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.api.apos.dto.request.CrearSucursalRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.dto.response.SucursalDto;

public interface UsuarioService extends UserDetailsService {
    JwtResponse registrarUsuario(String email,String password);

    JwtResponse login(String email, String password);

    List<SucursalDto> getSucursalesByUsuarioId(Long usuarioId);

    CrearSucursalRequest crearSucursalParaUsuario(Long usuarioId, CrearSucursalRequest request);

    void eliminarSucursalDeUsuario(Long usuarioId, Long sucursalId);
    
}
