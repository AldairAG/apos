package com.api.apos.features.caja.usecase;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;
import com.api.apos.domain.caja.caja.mapper.CajaMapper;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearCajaUseCase {

    private final CajaService cajaService;

    private final SucursalService sucursalService;

    public CajaDTO execute(CrearCajaRequest caja) {
        Caja nuevaCaja = Caja.builder()
                .nombre(caja.getNombre())
                .activa(caja.getActiva())
                .estado(EstadoCaja.CERRADA)
                .montoActual(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Sucursal sucursal = sucursalService.obtenerSucursalPorId(caja.getSucursalId());
        nuevaCaja.setSucursal(sucursal);

        Caja cajaGuardada = cajaService.crearCaja(nuevaCaja);

        return CajaMapper.toDTO(cajaGuardada);
    }

}
