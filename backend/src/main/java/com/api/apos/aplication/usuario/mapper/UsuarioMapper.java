package com.api.apos.aplication.usuario.mapper;

import com.api.apos.aplication.usuario.dto.UsuarioDto;
import com.api.apos.domain.auth.usuario.Usuario;

public class UsuarioMapper {
    
    public static UsuarioDto toDto(Usuario usuario){
        return UsuarioDto.builder()
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .telefono(usuario.getTelefono())
                .lada(usuario.getLada())
                .build();
    }
}
