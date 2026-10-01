package com.api.apos.aplication.identidad.empresa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.domain.organizacion.empresa.EmpresaService;
import com.api.apos.enums.Rol;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DesactivarEmpresaActualUseCase {

    private final UsuarioService usuarioService;
    private final EmpresaService empresaService;

    @Transactional
    public void execute() {
        var usuario = usuarioService.getUsuarioAutenticado();
        if (usuario.getRol() != Rol.ADMINISTRADOR) {
            throw new AppException(ErrorCode.RECURSO_NO_AUTORIZADO);
        }
        Empresa empresa = usuario.getEmpresa();
        if (empresa == null) {
            throw new AppException(ErrorCode.EMPRESA_NO_ENCONTRADA);
        }
        empresaService.delete(empresa.getId());
    }
}