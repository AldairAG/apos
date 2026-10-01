package com.api.apos.aplication.identidad.usuario.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DesactivarUsuarioActualUseCase {

    private final UsuarioService usuarioService;

    @Transactional
    public void execute() {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        usuario.delete();
        usuarioService.save(usuario);
    }
}