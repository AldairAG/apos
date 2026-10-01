package com.api.apos.aplication.tesoreria.cuenta.usecase;

import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.cuenta.Cuenta;
import com.api.apos.domain.financiero.cuenta.CuentaService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DesactivarCuentaUseCase {

    private final CuentaService cuentaService;
    private final UsuarioService usuarioService;

    @Transactional
    public void execute(Long cuentaId) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Cuenta cuenta = cuentaService.findById(cuentaId);
        if (usuario.getEmpresa() == null || cuenta.getEmpresa() == null
                || !Objects.equals(usuario.getEmpresa().getId(), cuenta.getEmpresa().getId())) {
            throw new AppException(ErrorCode.RECURSO_NO_AUTORIZADO);
        }
        cuentaService.deleteById(cuentaId);
    }
}