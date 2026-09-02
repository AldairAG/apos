package com.api.apos.aplication.movimiento.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.domain.cuenta.Cuenta;
import com.api.apos.domain.cuenta.CuentaService;
import com.api.apos.domain.movimiento.MovimientoService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarGastoUseCase {

    private final CuentaService cuentaService;

    private final MovimientoService movimientoService;

    public void execute(MovimientoDto movimientoDto) {

        Cuenta cuenta = cuentaService.findById(movimientoDto.getCuentaId());

        

    }

}
