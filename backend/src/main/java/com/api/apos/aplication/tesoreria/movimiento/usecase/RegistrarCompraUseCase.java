package com.api.apos.aplication.tesoreria.movimiento.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.inventario.existencia.dto.RegistrarMovimientoInventarioDto;
import com.api.apos.aplication.inventario.existencia.usecase.AjustarExistenciaUseCase;
import com.api.apos.aplication.tesoreria.movimiento.dto.MovimientoDto;
import com.api.apos.enums.ConceptoMovimientoInventario;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor
public class RegistrarCompraUseCase {

    private final RegistrarEgresoUseCase registrarEgresoUseCase;

    private final AjustarExistenciaUseCase ajustarExistenciaUseCase;

    public MovimientoDto execute(MovimientoDto movimientoDto) {

        RegistrarMovimientoInventarioDto registrarMovimientoInventarioDto =  RegistrarMovimientoInventarioDto.builder()
        .materialId(movimientoDto.getMaterialId())
        .sucursalId(movimientoDto.getSucursalId())
        .cantidad(movimientoDto.getCantidadCompra())
        .build();

        ajustarExistenciaUseCase.execute(registrarMovimientoInventarioDto,ConceptoMovimientoInventario.COMPRA);

        return registrarEgresoUseCase.execute(movimientoDto);
    }

}