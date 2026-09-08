package com.api.apos.aplication.movimiento.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.cuenta.Cuenta;
import com.api.apos.domain.financiero.cuenta.CuentaService;
import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.financiero.movimiento.MovimientoService;
import com.api.apos.enums.CategoriaMovimiento;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class RegistrarIngresoUseCase {
    
    private final MovimientoService movimientoService;

    private final CuentaService cuentaService;

    private final UsuarioService usuarioService;

    @Transactional 
    public MovimientoDto execute(MovimientoDto movimientoDto) {
        
        Cuenta cuenta = cuentaService.findById(movimientoDto.getCuentaId());

        Movimiento movimiento = Movimiento.builder()
                .descripcion(movimientoDto.getDescripcion())
                .monto(movimientoDto.getMonto())
                .categoria(CategoriaMovimiento.INGRESO)
                .createdBy(usuarioService.getUsuarioAutenticadoId())
                .build();

        cuenta.addIngreso(movimiento);

        return MovimientoMapper.toDto(movimientoService.save(movimiento));
    }

}
