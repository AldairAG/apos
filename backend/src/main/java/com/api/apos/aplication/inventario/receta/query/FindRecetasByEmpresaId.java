package com.api.apos.aplication.inventario.receta.query;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.dto.PageResponse;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindRecetasByEmpresaId {

    private final RecetaService recetaService;

    private final UsuarioService usuarioService;

    public PageResponse<RecetaDto> execute(String nombre,Pageable pageable) {

        Long empresaId = usuarioService.getEmpresaFromAuthenticatedUser().getId();

        return PageResponse.from(
            recetaService
                .findByEmpresaId(empresaId, nombre, pageable)
                .map(RecetaMapper::toDto)
        );
    }

}
