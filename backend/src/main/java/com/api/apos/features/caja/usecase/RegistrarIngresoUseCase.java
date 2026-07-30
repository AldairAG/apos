package com.api.apos.features.caja.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.service.UsuarioService;
import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.MovimientoCajaService;
import com.api.apos.domain.caja.movimeinto.mapper.MovimientoMapper;
import com.api.apos.enums.TipoMovimientoCaja;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarIngresoUseCase {

    private final MovimientoCajaService movimientoService;

    private final CajaService cajaService;

    private final UsuarioService usuarioService;
    
    public MovimientoCajaDTO execute(MovimientoCajaDTO movimiento) {

        // Validar que la caja exista
        Caja caja = cajaService.obtenerCajaPorId(movimiento.getCajaId());

        // Obtener el ususario autenticado
        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();
        
        MovimientoCaja movimientoEntity = MovimientoCaja.builder()
                .tipoMovimiento(TipoMovimientoCaja.INGRESO)
                .monto(movimiento.getMonto())
                .conceptoMovimiento(movimiento.getConceptoMovimiento())
                .concepto(movimiento.getConcepto())
                .referencia(movimiento.getReferencia())
                .fecha(LocalDateTime.now())
                .caja(caja)
                .aprobado(false)
                .createdAt(LocalDateTime.now())
                .createdBy(usuario.getId())
                .corteCajaId(caja.getCorteActualId())
                .build();

        MovimientoCaja movimientoRegistrado = movimientoService.registrarMovimiento(movimientoEntity);
        
        return MovimientoMapper.toDTO(movimientoRegistrado);
    }

}
