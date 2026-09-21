package com.api.apos.aplication.tesoreria.movimiento.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.tesoreria.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.tesoreria.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.financiero.corte_caja.CorteCajaService;
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

    private final CorteCajaService corteCajaService;

    @Transactional 
    public MovimientoDto execute(MovimientoDto movimientoDto) {

        Movimiento movimiento;

        if (movimientoDto.getCuentaId() != null) {
            movimiento = crearACuenta(movimientoDto);
        } else if (movimientoDto.getCajaId() != null) {
            movimiento = crearEnCorteCaja(movimientoDto);
        } else {
            throw new IllegalArgumentException("Debe especificar una cuenta o un corte de caja para el ingreso");
        }


        return MovimientoMapper.toDto(movimientoService.save(movimiento));
    }

    private Movimiento crearACuenta(MovimientoDto movimientoDto) {
                
        Cuenta cuenta = cuentaService.findById(movimientoDto.getCuentaId());

        Movimiento movimiento = Movimiento.builder()
                .descripcion(movimientoDto.getDescripcion())
                .monto(movimientoDto.getMonto())
                .categoria(CategoriaMovimiento.INGRESO)
                .createdBy(usuarioService.getUsuarioAutenticadoId())
                .fecha(movimientoDto.getFecha())
                .build();

        cuenta.addIngreso(movimiento);

        return movimiento;
    }

    private Movimiento crearEnCorteCaja(MovimientoDto movimientoDto) {
        CorteCaja corteCaja = corteCajaService.findCorteActivo(movimientoDto.getCajaId());

        Movimiento movimiento = Movimiento.builder()
                .descripcion(movimientoDto.getDescripcion())
                .monto(movimientoDto.getMonto())
                .categoria(CategoriaMovimiento.INGRESO)
                .createdBy(usuarioService.getUsuarioAutenticadoId())
                .fecha(movimientoDto.getFecha())
                .build();

        corteCaja.addIngreso(movimiento);

        return movimiento;
    }

}
