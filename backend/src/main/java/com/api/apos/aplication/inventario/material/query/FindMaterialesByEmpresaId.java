package com.api.apos.aplication.inventario.material.query;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.inventario.material.dto.MaterialDto;
import com.api.apos.aplication.inventario.material.mapper.MaterialMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.material.MaterialService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindMaterialesByEmpresaId {

    private final MaterialService materialService;

    private final UsuarioService usuarioService;

    public Page<MaterialDto> execute(String nombre, Pageable pageable) {

        Long empresaId = usuarioService.getEmpresaFromAuthenticatedUser().getId();

        return materialService
                .findByEmpresaId(empresaId, nombre, pageable)
                .map(MaterialMapper::toDto);
    }
}
