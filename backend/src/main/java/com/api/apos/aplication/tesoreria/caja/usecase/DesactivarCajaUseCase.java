package com.api.apos.aplication.tesoreria.caja.usecase;

import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.caja.CajaService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DesactivarCajaUseCase {

    private final CajaService cajaService;
    private final UsuarioService usuarioService;

    @Transactional
    public void execute(Long cajaId) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Caja caja = cajaService.findById(cajaId);
        if (usuario.getEmpresa() == null || caja.getSucursal() == null || caja.getSucursal().getEmpresa() == null
                || !Objects.equals(usuario.getEmpresa().getId(), caja.getSucursal().getEmpresa().getId())) {
            throw new AppException(ErrorCode.RECURSO_NO_AUTORIZADO);
        }
        cajaService.delete(cajaId);
    }
}