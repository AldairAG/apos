package com.api.apos.aplication.identidad.sucursal.usecase;

import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DesactivarSucursalUseCase {

    private final SucursalService sucursalService;
    private final UsuarioService usuarioService;

    @Transactional
    public void execute(Long sucursalId) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Sucursal sucursal = sucursalService.findById(sucursalId);
        if (usuario.getEmpresa() == null || sucursal.getEmpresa() == null
                || !Objects.equals(usuario.getEmpresa().getId(), sucursal.getEmpresa().getId())) {
            throw new AppException(ErrorCode.RECURSO_NO_AUTORIZADO);
        }
        sucursalService.delete(sucursalId);
    }
}