package com.api.apos.aplication.receta.query;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.receta.dto.RecetaDto;
import com.api.apos.aplication.receta.mapper.RecetaMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.receta.RecetaService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindRecetasByEmpresaId {

    private final RecetaService recetaService;

    private final UsuarioService usuarioService;

    public Page<RecetaDto> execute(String nombre,Pageable pageable) {

        Long empresaId = usuarioService.getEmpresaFromAuthenticatedUser().getId();

        return recetaService
                .findByEmpresaId(empresaId, nombre, pageable)
                .map(RecetaMapper::toDto);
    }

}
