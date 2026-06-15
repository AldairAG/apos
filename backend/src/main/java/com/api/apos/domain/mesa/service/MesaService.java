package com.api.apos.domain.mesa.service;

import java.util.List;

import com.api.apos.domain.mesa.entity.Mesa;
import com.api.apos.enums.EstadoMesa;

public interface MesaService {
    Mesa crearMesa(Mesa mesa);
    Mesa actualizarMesa(Long id, Mesa mesa);
    void eliminarMesa(Long id);
    Mesa obtenerMesaPorId(Long id);
    List<Mesa> obtenerMesasPorSucursal(Long idSucursal);
    List<Mesa> obtenerMesasPorEstado(Long idSucursal, EstadoMesa estado);
    Mesa cambiarEstadoMesa(Long id, EstadoMesa nuevoEstado);
    List<Mesa> obtenerMesasDisponibles(Long idSucursal);
}
