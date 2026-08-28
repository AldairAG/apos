package com.api.apos.aplication.usuario.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.usuario.dto.UsuarioDto;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ObtenerUsuarioActualUseCase {
    
    private final UsuarioService usuarioService;


    public UsuarioDto execute() {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        return UsuarioDto.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .telefono(usuario.getTelefono())
                .lada(usuario.getLada())
                .empresa(usuario.getEmpresa())
                .build();
    }

}
