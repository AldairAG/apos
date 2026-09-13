package com.api.apos.aplication.sucursal.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.sucursal.dto.SucursalDto;
import com.api.apos.aplication.sucursal.mapper.SucursalMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindSucursalesByEmpresaId {

    private final SucursalService sucursalService;

    private final UsuarioService usuarioService;

    public List<SucursalDto> execute() {
        Long empresaId = usuarioService.getEmpresaFromAuthenticatedUser().getId();
        return sucursalService.findAllByEmpresaId(empresaId)
            .stream()
            .map(SucursalMapper::toDto)
            .toList();
    }
}
