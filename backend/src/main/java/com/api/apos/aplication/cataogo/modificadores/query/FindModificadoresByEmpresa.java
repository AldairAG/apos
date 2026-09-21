package com.api.apos.aplication.cataogo.modificadores.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.mapper.ModificadorMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.organizacion.empresa.Empresa;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindModificadoresByEmpresa {

    private final ModificadorService modificadorService;

    private final UsuarioService usuarioService;

    public List<ModificadorDto> execute() {

        Empresa empresa = usuarioService.getEmpresaFromAuthenticatedUser();

        return modificadorService.findByEmpresaId(empresa.getId())
                .stream()
                .map(ModificadorMapper::toDto)
                .toList();

    }

}
