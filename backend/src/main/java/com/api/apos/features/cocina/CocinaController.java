package com.api.apos.features.cocina;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.mapper.PosMapper;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cocina")
@AllArgsConstructor
public class CocinaController {

    private final OrdenService ordenService;

    private static final List<EstadoOrden> ESTADOS_COCINA = List.of(
            EstadoOrden.PENDIENTE,
            EstadoOrden.EN_PREPARACION,
            EstadoOrden.LISTA);
@GetMapping("/sucursales/{sucursalId}/ordenes")
public ApiResponseWrapper<List<OrdenResponseDTO>> obtenerOrdenesPendientes(
        @PathVariable Long sucursalId) {

    List<OrdenResponseDTO> ordenes = ordenService
            .obtenerOrdenesPorSucursalYEstados(sucursalId, ESTADOS_COCINA)
            .stream()
            .map(PosMapper::mapOrdenToResponseDTO)
            .toList();

    return new ApiResponseWrapper<>(true, ordenes, null);
}
}
