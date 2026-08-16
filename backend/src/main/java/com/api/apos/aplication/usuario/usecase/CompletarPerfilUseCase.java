package com.api.apos.aplication.usuario.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.usuario.dto.UsuarioDto;
import com.api.apos.aplication.usuario.mapper.UsuarioMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.dto.request.AuthRequest;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CompletarPerfilUseCase {

    private final UsuarioService usuarioService;
    
    public UsuarioDto execute(AuthRequest request) {

        Usuario usuario = usuarioService.getUsuarioAutenticado();

        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setEmail(request.getEmail());
        usuario.setLada(request.getLada());
        usuario.setTelefono(request.getTelefono());
        usuario.setRol(request.getRol());

        return UsuarioMapper.toDto(usuarioService.save(usuario));
    }

}
