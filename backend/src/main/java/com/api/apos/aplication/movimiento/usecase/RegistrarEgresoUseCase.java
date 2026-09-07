package com.api.apos.aplication.movimiento.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.cuenta.Cuenta;
import com.api.apos.domain.cuenta.CuentaService;
import com.api.apos.domain.movimiento.Movimiento;
import com.api.apos.domain.movimiento.MovimientoService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor
public class RegistrarEgresoUseCase {

    private final CuentaService cuentaService;

    private final MovimientoService movimientoService;

    private final UsuarioService usuarioService;

    @Transactional
    public MovimientoDto execute(MovimientoDto movimientoDto) {

        Cuenta cuenta = cuentaService.findById(movimientoDto.getCuentaId());

        Movimiento movimiento = Movimiento.builder()
                .descripcion(movimientoDto.getDescripcion())
                .monto(movimientoDto.getMonto())
                .categoria(movimientoDto.getCategoria())
                .createdBy(usuarioService.getUsuarioAutenticadoId())
                .build();

        cuenta.addEgreso(movimiento);

        movimientoService.save(movimiento);

        return MovimientoMapper.toDto(movimiento);
    }

}
