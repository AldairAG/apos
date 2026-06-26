package com.api.apos.domain.pos.service;

import java.util.List;

import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.pos.dto.CrearOrdenDTO;
import com.api.apos.domain.pos.dto.MesaResponseDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse;

public interface POSService {
    List<ProductosBySucursalResponse> obtnerProdcutosBySucursal(Long sucursalId);

    OrdenResponseDTO crearOrden(CrearOrdenDTO crearOrdenDTO);

    Mesa cambiarEstadoMesa(Long mesaId, Boolean disponible);

    List<OrdenResponseDTO> obtenerOrdenesPorSucursal(Long sucursalId);

    List<MesaResponseDTO> obtenerMesasPorSucursal(Long sucursalId);
    
}
