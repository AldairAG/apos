package com.api.apos.domain.pos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.catalogo.producto.dto.ProductoDTO;
import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.mesa.service.MesaService;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.domain.pos.dto.MesaResponseDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse;
import com.api.apos.domain.pos.mapper.PosMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class POSServiceImpl implements POSService {

    private final ProductoService productoService;

    private final OrdenService ordenService;

    private final MesaService mesaService;

    @Override
    public List<ProductosBySucursalResponse> obtnerProdcutosBySucursal(Long sucursalId) {
        List<ProductoDTO> productos = productoService.obtenerProductosPorSucursal(sucursalId);

        List<ProductosBySucursalResponse> response = productos.stream()
                .map(producto -> {
                    ProductosBySucursalResponse res = new ProductosBySucursalResponse();
                    res.setId(producto.getId());
                    res.setNombre(producto.getNombre());
                    res.setDescripcion(producto.getDescripcion());
                    res.setPrecioVenta(producto.getPrecioVenta());
                    res.setTiempoPreparacion(producto.getTiempoPreparacion());
                    res.setActivo(producto.getActivo());
                    res.setDisponible(producto.getDisponible());
                    res.setDestacado(producto.getDestacado());
                    res.setCategoria(producto.getCategoria());
                    res.setGruposExtra(producto.getGruposExtra());
                    return res;
                })
                .toList();

        return response;
    }

    @Override
    public Mesa cambiarEstadoMesa(Long mesaId, Boolean disponible) {
        return null;
    }

    @Override
    public List<OrdenResponseDTO> obtenerOrdenesPorSucursal(Long sucursalId) {
        List<Orden> ordenes = ordenService.obtenerOrdenesPorSucursal(sucursalId);

        List<OrdenResponseDTO> response = ordenes.stream()
                .map(PosMapper::mapOrdenToResponseDTO)
                .toList();

        return response;
    }

    @Override
    public List<MesaResponseDTO> obtenerMesasPorSucursal(Long sucursalId) {
        List<Mesa> mesas = mesaService.obtenerMesasPorSucursal(sucursalId);

        List<MesaResponseDTO> response = mesas.stream()
                .map(mesa -> {

                    MesaResponseDTO res = new MesaResponseDTO();
                    res.setId(mesa.getId());
                    res.setNombre(mesa.getNombre());
                    res.setEstado(mesa.getEstado());
                    res.setActiva(mesa.getActiva());

                    Optional<Orden> ordenActual = ordenService.obtenerOrdenPorId(mesa.getOrdenActual());
                    if (ordenActual.isPresent()) {
                        res.setOrdenActualDTO(PosMapper.mapOrdenToResponseDTO(ordenActual.get()));
                    } else {
                        res.setOrdenActualDTO(null);
                    }
                    return res;
                })
                .toList();

        return response;
    }

}
