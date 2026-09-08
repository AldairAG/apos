package com.api.apos.aplication.caja.usecase;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.caja.CajaService;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.financiero.corte_caja.CorteCajaService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class AbrirCajaUseCase {

    private final CajaService cajaService;

    private final CorteCajaService corteCajaService;

    private final UsuarioService usuarioService;
    
    public void execute(Long cajaId) {

        Caja caja =cajaService.findById(cajaId);

        if (corteCajaService.existCorteActivo(cajaId)) {
            throw new AppException(ErrorCode.ERROR_AL_ABRIR_CAJA);
        }

        CorteCaja corteCaja = CorteCaja.builder()
            .caja(caja)
            .saldoInicial(caja.getSaldo())
            .egresos(BigDecimal.ZERO)
            .gastos(BigDecimal.ZERO)
            .ingresos(BigDecimal.ZERO)
            .ventas(BigDecimal.ZERO)
            .createdBy(usuarioService.getUsuarioAutenticadoId())
            .build();
        
        caja.abrir(corteCaja);

        corteCajaService.save(corteCaja);

    }

}
