package com.api.apos.domain.caja.gasto.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.gasto.entity.Gasto;
import com.api.apos.enums.TipoGasto;

public interface GastoService {
    Gasto registrarGasto(Gasto gasto);
    Gasto actualizarGasto(Long id, Gasto gasto);
    void eliminarGasto(Long id);
    Gasto obtenerGastoPorId(Long id);
    List<Gasto> obtenerGastosPorSucursal(Long idSucursal);
    List<Gasto> obtenerGastosPorTipo(Long idSucursal, TipoGasto tipo);
    List<Gasto> obtenerGastosPorEmpleado(Long idEmpleado);
    List<Gasto> obtenerGastosPorFecha(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}
