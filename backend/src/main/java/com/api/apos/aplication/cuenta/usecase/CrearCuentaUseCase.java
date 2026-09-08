package com.api.apos.aplication.cuenta.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cuenta.dto.CuentaDto;
import com.api.apos.aplication.cuenta.mapper.CuentaMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.cuenta.Cuenta;
import com.api.apos.domain.financiero.cuenta.CuentaRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CrearCuentaUseCase {

    private final CuentaRepository cuentaRepository;

    private final UsuarioService usuarioService;

    public CuentaDto execute(CuentaDto cuentaDto) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        
        Cuenta cuenta = Cuenta.builder()
                .nombre(cuentaDto.getNombre())
                .activa(true)
                .nombre(cuentaDto.getNombre())
                .saldo(cuentaDto.getSaldo())
                .tipo(cuentaDto.getTipo())
                .empresa(usuario.getEmpresa())
                .build();

        return CuentaMapper.toDto(cuentaRepository.save(cuenta));

    }
}