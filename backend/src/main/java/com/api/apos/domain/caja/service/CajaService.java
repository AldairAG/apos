package com.api.apos.domain.caja.service;

import java.util.List;

import com.api.apos.domain.caja.entity.Caja;

public interface CajaService {
    Caja crearCaja(Caja caja);
    Caja actualizarCaja(Long id, Caja caja);
    void eliminarCaja(Long id);
    Caja obtenerCajaPorId(Long id);
    List<Caja> obtenerCajasPorSucursal(Long idSucursal);
    List<Caja> obtenerCajasActivas(Long idSucursal);
    Caja activarCaja(Long id);
    Caja desactivarCaja(Long id);
}
