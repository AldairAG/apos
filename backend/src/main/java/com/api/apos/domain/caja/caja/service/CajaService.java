package com.api.apos.domain.caja.caja.service;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;

public interface CajaService {
    CajaDTO crearCaja(CrearCajaRequest caja);
    Caja actualizarCaja(Long id, Caja caja);
    Caja modificarSaldo(Long id, BigDecimal monto);
    void eliminarCaja(Long id);
    Caja obtenerCajaPorId(Long id); 
    List<CajaDTO> obtenerCajasPorSucursal(Long idSucursal);

}
