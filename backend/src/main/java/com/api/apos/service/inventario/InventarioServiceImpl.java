package com.api.apos.service.inventario;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.dto.request.AgregarItemRequest;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.Material;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.InventarioItemRepository;
import com.api.apos.repository.InventarioRepository;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.SucursalRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired
    private InventarioItemRepository inventarioItemRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    // ==================== INVENTARIO ====================

    @Override
    @Transactional(readOnly = true)
    public Inventario obtenerInventarioPorSucursal(Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        Inventario inventario = sucursal.getInventario();
        if (inventario == null) {
            throw new EntityNotFoundException("La sucursal no tiene inventario asignado");
        }
        return inventario;
    }

    // ==================== INVENTARIO ITEMS (Materiales) ====================
    @Override
    public InventarioItem agregarItemInventario(Long inventarioId, AgregarItemRequest request) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        Material material;
        if (request.getMaterialId() != null) {
            material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new EntityNotFoundException("Material no encontrado con id: " + request.getMaterialId()));
        } else {
            Material newMaterial = Material.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .tipoMaterial(request.getTipoMaterial())
                .tipoUnidad(request.getTipoUnidad())
                .activo(true)
                .build();
            material = materialRepository.save(newMaterial);
        }

        return inventarioItemRepository.save(InventarioItem.builder()
                .inventario(inventario)
                .material(material)
                .cantidad(request.getCantidad())
                .precioUnitario(request.getPrecioUnitario())
                .stockMinimo(request.getStockMinimo())
                .stockMaximo(request.getStockMaximo())
                .fechaUltimaActualizacion(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime())
                .fechaUltimaCompra(null)
                .build());
    }

    @Override
    public InventarioItem editarItemInventario(Long itemId, AgregarItemRequest request) {
        InventarioItem item = inventarioItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("InventarioItem no encontrado con id: " + itemId));

        Material material = materialRepository.findById(request.getMaterialId())
                .or(() -> {
                    if (request.getMaterialId() != null) {
                        throw new EntityNotFoundException("Material no encontrado con id: " + request.getMaterialId());
                    }
                    Material newMaterial = Material.builder()
                            .nombre(request.getNombre())
                            .descripcion(request.getDescripcion())
                            .tipoMaterial(request.getTipoMaterial())
                            .tipoUnidad(request.getTipoUnidad())
                            .activo(true)
                            .build();
                    return Optional.of(materialRepository.save(newMaterial));
                })
                .orElseThrow(() -> new EntityNotFoundException("No se pudo crear o encontrar el material"));

        item.setMaterial(material);
        item.setCantidad(request.getCantidad());
        item.setPrecioUnitario(request.getPrecioUnitario());
        item.setStockMinimo(request.getStockMinimo());
        item.setStockMaximo(request.getStockMaximo());

        return inventarioItemRepository.save(item);
    }

    @Override
    public void eliminarItemInventario(Long itemId) {
        InventarioItem item = inventarioItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("InventarioItem no encontrado con id: " + itemId));
        inventarioItemRepository.delete(item);
    }

    @Override
    public List<InventarioItem> obtenerItemsPorInventario(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));
        return inventarioItemRepository.findByInventarioId(inventario.getId());
    }

    @Override
    public List<InventarioItem> obtenerItemsConStockBajo(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));
        return inventarioItemRepository.findByInventarioIdAndCantidadLessThanStockMinimo(inventario.getId());
    }

    // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

}
