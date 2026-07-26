package com.api.apos.features.caja.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.corte.service.CorteCajaService;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AbrirCajaUseCase {

    private final CajaService cajaService;

    private final CorteCajaService corteCajaService;

    @Transactional
    public Caja execute(Long cajaId, Long empleadoId) {
        // Obtener la caja por su id
        Caja caja = cajaService.obtenerCajaPorId(cajaId);

        // Crear un corte de caja con el monto inicial y el empleado que lo abre
        CorteCaja corteCaja = CorteCaja.builder()
                .caja(caja)
                .montoInicial(caja.getMontoActual())
                .fechaInicio(LocalDateTime.now())
                .montoInicial(caja.getMontoActual())
                .cerrado(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(empleadoId)
                .build();

        // Guardar el corte de caja en la base de datos
        corteCajaService.guardarCorteCaja(corteCaja);

        // Actualizar el estado de la caja a "abierta"
        caja.setEstado(EstadoCaja.ABIERTA);
        cajaService.actualizarCaja(caja.getId(), caja);
        return caja;
    }
}
