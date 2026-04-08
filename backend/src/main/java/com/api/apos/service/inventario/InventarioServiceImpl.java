package com.api.apos.service.inventario;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;
import com.api.apos.entity.Material;
import com.api.apos.entity.ProductoElaborado;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.InventarioItemRepository;
import com.api.apos.repository.InventarioProductoRepository;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.ProductoElaboradoRepository;
import com.api.apos.repository.SucursalRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired
    private InventarioItemRepository inventarioItemRepository;

    @Autowired
    private InventarioProductoRepository inventarioProductoRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ProductoElaboradoRepository productoElaboradoRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private EntityManager entityManager;

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

    @Override
    @Transactional
    public Inventario crearInventarioParaSucursal(Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        if (sucursal.getInventario() != null) {
            throw new IllegalArgumentException("La sucursal ya tiene un inventario asignado");
        }

        Inventario inventario = new Inventario();
        inventario.setSucursal(sucursal);
        entityManager.persist(inventario);
        return inventario;
    }

    // ==================== INVENTARIO ITEMS (Materiales) ====================

    @Override
    @Transactional(readOnly = true)
    public List<InventarioItem> obtenerItemsPorInventario(Long inventarioId) {
        return inventarioItemRepository.findByInventarioId(inventarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public InventarioItem obtenerItemPorId(Long itemId) {
        return inventarioItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("InventarioItem no encontrado con id: " + itemId));
    }

    @Override
    @Transactional
    public InventarioItem agregarItem(Long inventarioId, Long materialId, Double cantidad, Double stockMinimo,
            Double stockMaximo, Double precioUnitario) {
        Inventario inventario = entityManager.find(Inventario.class, inventarioId);
        if (inventario == null) {
            throw new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId);
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material no encontrado con id: " + materialId));

        inventarioItemRepository.findByInventarioAndMaterial(inventario, material)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Ya existe un item con el material '" + material.getNombre() + "' en este inventario");
                });

        InventarioItem item = new InventarioItem();
        item.setInventario(inventario);
        item.setMaterial(material);
        item.setCantidad(cantidad);
        item.setStockMinimo(stockMinimo);
        item.setStockMaximo(stockMaximo);
        item.setPrecioUnitario(precioUnitario);
        item.setFechaUltimaActualizacion(LocalDateTime.now());

        return inventarioItemRepository.save(item);
    }

    @Override
    @Transactional
    public InventarioItem actualizarItem(Long itemId, Double cantidad, Double stockMinimo, Double stockMaximo,
            Double precioUnitario) {
        InventarioItem item = inventarioItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("InventarioItem no encontrado con id: " + itemId));

        if (cantidad != null)
            item.setCantidad(cantidad);
        if (stockMinimo != null)
            item.setStockMinimo(stockMinimo);
        if (stockMaximo != null)
            item.setStockMaximo(stockMaximo);
        if (precioUnitario != null)
            item.setPrecioUnitario(precioUnitario);

        item.setFechaUltimaActualizacion(LocalDateTime.now());
        return inventarioItemRepository.save(item);
    }

    @Override
    @Transactional
    public void eliminarItem(Long itemId) {
        if (!inventarioItemRepository.existsById(itemId)) {
            throw new EntityNotFoundException("InventarioItem no encontrado con id: " + itemId);
        }
        inventarioItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public InventarioItem actualizarStockMaterial(Long inventarioId, Long materialId, Double cantidadDelta) {
        Inventario inventario = entityManager.find(Inventario.class, inventarioId);
        if (inventario == null) {
            throw new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId);
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material no encontrado con id: " + materialId));

        InventarioItem item = inventarioItemRepository.findByInventarioAndMaterial(inventario, material)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe item para el material '" + material.getNombre() + "' en este inventario"));

        Double nuevaCantidad = item.getCantidad() + cantidadDelta;
        if (nuevaCantidad < 0) {
            throw new IllegalArgumentException("Stock insuficiente. Stock actual: " + item.getCantidad()
                    + ", cantidad solicitada: " + Math.abs(cantidadDelta));
        }

        item.setCantidad(nuevaCantidad);
        item.setFechaUltimaActualizacion(LocalDateTime.now());
        return inventarioItemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioItem> obtenerItemsConStockBajo(Long inventarioId) {
        return inventarioItemRepository.findByInventarioIdAndCantidadLessThanStockMinimo(inventarioId);
    }

    // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

    @Override
    @Transactional(readOnly = true)
    public List<InventarioProducto> obtenerProductosPorInventario(Long inventarioId) {
        return inventarioProductoRepository.findByInventarioId(inventarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public InventarioProducto obtenerProductoPorId(Long productoId) {
        return inventarioProductoRepository.findById(productoId)
                .orElseThrow(
                        () -> new EntityNotFoundException("InventarioProducto no encontrado con id: " + productoId));
    }

    @Override
    @Transactional
    public InventarioProducto agregarProductoElaborado(Long inventarioId, Long productoElaboradoId, Double cantidad,
            Double stockMinimo) {
        Inventario inventario = entityManager.find(Inventario.class, inventarioId);
        if (inventario == null) {
            throw new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId);
        }

        ProductoElaborado productoElaborado = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));

        inventarioProductoRepository.findByInventarioAndProductoElaborado(inventario, productoElaborado)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Ya existe el producto '" + productoElaborado.getNombre() + "' en este inventario");
                });

        InventarioProducto ip = new InventarioProducto();
        ip.setInventario(inventario);
        ip.setProductoElaborado(productoElaborado);
        ip.setCantidad(cantidad);
        ip.setStockMinimo(stockMinimo);
        ip.setFechaUltimaActualizacion(LocalDateTime.now());

        return inventarioProductoRepository.save(ip);
    }

    @Override
    @Transactional
    public InventarioProducto actualizarProductoElaborado(Long productoId, Double cantidad, Double stockMinimo) {
        InventarioProducto ip = inventarioProductoRepository.findById(productoId)
                .orElseThrow(
                        () -> new EntityNotFoundException("InventarioProducto no encontrado con id: " + productoId));

        if (cantidad != null)
            ip.setCantidad(cantidad);
        if (stockMinimo != null)
            ip.setStockMinimo(stockMinimo);

        ip.setFechaUltimaActualizacion(LocalDateTime.now());
        return inventarioProductoRepository.save(ip);
    }

    @Override
    @Transactional
    public void eliminarProductoElaborado(Long productoId) {
        if (!inventarioProductoRepository.existsById(productoId)) {
            throw new EntityNotFoundException("InventarioProducto no encontrado con id: " + productoId);
        }
        inventarioProductoRepository.deleteById(productoId);
    }

    @Override
    @Transactional
    public InventarioProducto actualizarStockProducto(Long inventarioId, Long productoElaboradoId,
            Double cantidadDelta) {
        Inventario inventario = entityManager.find(Inventario.class, inventarioId);
        if (inventario == null) {
            throw new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId);
        }

        ProductoElaborado productoElaborado = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));

        InventarioProducto ip = inventarioProductoRepository
                .findByInventarioAndProductoElaborado(inventario, productoElaborado)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe el producto '" + productoElaborado.getNombre() + "' en este inventario"));

        Double nuevaCantidad = ip.getCantidad() + cantidadDelta;
        if (nuevaCantidad < 0) {
            throw new IllegalArgumentException("Stock insuficiente. Stock actual: " + ip.getCantidad()
                    + ", cantidad solicitada: " + Math.abs(cantidadDelta));
        }

        ip.setCantidad(nuevaCantidad);
        ip.setFechaUltimaActualizacion(LocalDateTime.now());
        return inventarioProductoRepository.save(ip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioProducto> obtenerProductosConStockBajo(Long inventarioId) {
        return inventarioProductoRepository.findByInventarioIdAndCantidadLessThanStockMinimo(inventarioId);
    }
}
