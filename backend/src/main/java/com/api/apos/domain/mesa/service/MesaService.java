package com.api.apos.domain.mesa.service;

import java.util.List;

import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.mesa.dto.CrearMesaDTO;
import com.api.apos.enums.EstadoMesa;

public interface MesaService {
    Mesa crearMesa(CrearMesaDTO mesa, Long sucursalId);
    Mesa actualizarMesa(Long id, Mesa mesa);
    void eliminarMesa(Long id);
    Mesa obtenerMesaPorId(Long id);
    List<Mesa> obtenerMesasPorSucursal(Long idSucursal);
    Mesa cambiarEstadoMesa(Long id, EstadoMesa nuevoEstado);
    Mesa asignarOrdenAMesa(Long idMesa, Long idOrden);
    Mesa liberarMesa(Long idMesa);
}
