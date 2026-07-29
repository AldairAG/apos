package com.api.apos.features.caja.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;
import com.api.apos.domain.caja.caja.mapper.CajaMapper;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

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
                .build();

        Sucursal sucursal = sucursalService.obtenerSucursalPorId(caja.getSucursalId());
        nuevaCaja.setSucursal(sucursal);

        Caja cajaGuardada = cajaService.crearCaja(nuevaCaja);

        return CajaMapper.toDTO(cajaGuardada);
    }

}
