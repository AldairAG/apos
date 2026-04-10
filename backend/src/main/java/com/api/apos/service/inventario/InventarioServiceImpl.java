package com.api.apos.service.inventario;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.dto.request.ActualizarStockProductoRequest;
import com.api.apos.dto.request.AgregarItemRequest;
import com.api.apos.dto.request.AgregarProductoElaboradoRequest;
import com.api.apos.dto.response.ProductoElaboradoStockResponse;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;
import com.api.apos.entity.Material;
import com.api.apos.entity.ProductoElaborado;
import com.api.apos.entity.Receta;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.InventarioItemRepository;
import com.api.apos.repository.InventarioProductoRepository;
import com.api.apos.repository.InventarioRepository;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.ProductoElaboradoRepository;
import com.api.apos.repository.RecetaRepository;
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

    @Autowired
    private InventarioProductoRepository inventarioProductoRepository;

    @Autowired
    private ProductoElaboradoRepository productoElaboradoRepository;

    @Autowired
    private RecetaRepository recetaRepository;

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
    @Transactional
    public InventarioProducto agregarProductoElaborado(Long inventarioId, AgregarProductoElaboradoRequest request) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        ProductoElaborado productoElaborado;

        // Si viene el ID, buscar producto elaborado existente
        if (request.getProductoElaboradoId() != null) {
            productoElaborado = productoElaboradoRepository.findById(request.getProductoElaboradoId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Producto elaborado no encontrado con id: " + request.getProductoElaboradoId()));
        } else {
            // Crear nuevo producto elaborado
            productoElaborado = new ProductoElaborado();
            productoElaborado.setNombre(request.getNombre());
            productoElaborado.setDescripcion(request.getDescripcion());
            productoElaborado.setUnidadMedida(request.getUnidadMedida());
            productoElaborado.setActivo(true);
            productoElaborado.setFechaCreacion(LocalDateTime.now());

            // Asociar receta origen si se proporciona
            if (request.getRecetaOrigenId() != null) {
                Receta receta = recetaRepository.findById(request.getRecetaOrigenId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Receta no encontrada con id: " + request.getRecetaOrigenId()));
                productoElaborado.setRecetaOrigen(receta);
            }

            productoElaborado = productoElaboradoRepository.save(productoElaborado);
        }

        // Verificar si ya existe en el inventario
        Optional<InventarioProducto> existente = inventarioProductoRepository
                .findByInventarioAndProductoElaborado(inventario, productoElaborado);

        if (existente.isPresent()) {
            throw new IllegalStateException(
                    "El producto elaborado ya existe en este inventario. Use actualizarStockProducto para modificarlo.");
        }

        // Crear el registro en inventario
        InventarioProducto inventarioProducto = new InventarioProducto();
        inventarioProducto.setInventario(inventario);
        inventarioProducto.setProductoElaborado(productoElaborado);
        inventarioProducto.setCantidad(request.getCantidad() != null ? request.getCantidad() : 0.0);
        inventarioProducto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);
        inventarioProducto.setFechaUltimaActualizacion(LocalDateTime.now());

        return inventarioProductoRepository.save(inventarioProducto);
    }

    @Override
    @Transactional
    public InventarioProducto actualizarStockProducto(Long inventarioProductoId,
            ActualizarStockProductoRequest request) {
        InventarioProducto inventarioProducto = inventarioProductoRepository.findById(inventarioProductoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Inventario producto no encontrado con id: " + inventarioProductoId));

        if (request.getCantidad() != null) {
            inventarioProducto.setCantidad(request.getCantidad());
        }

        if (request.getStockMinimo() != null) {
            inventarioProducto.setStockMinimo(request.getStockMinimo());
        }

        inventarioProducto.setFechaUltimaActualizacion(LocalDateTime.now());

        return inventarioProductoRepository.save(inventarioProducto);
    }

    @Override
    @Transactional
    public void incrementarStockProducto(Long inventarioId, Long productoElaboradoId, Double cantidad) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        ProductoElaborado productoElaborado = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto elaborado no encontrado con id: " + productoElaboradoId));

        Optional<InventarioProducto> inventarioProductoOpt = inventarioProductoRepository
                .findByInventarioAndProductoElaborado(inventario, productoElaborado);

        InventarioProducto inventarioProducto;
        if (inventarioProductoOpt.isPresent()) {
            inventarioProducto = inventarioProductoOpt.get();
            inventarioProducto.setCantidad(inventarioProducto.getCantidad() + cantidad);
        } else {
            // Crear nuevo registro si no existe
            inventarioProducto = new InventarioProducto();
            inventarioProducto.setInventario(inventario);
            inventarioProducto.setProductoElaborado(productoElaborado);
            inventarioProducto.setCantidad(cantidad);
            inventarioProducto.setStockMinimo(0.0);
        }

        inventarioProducto.setFechaUltimaProduccion(LocalDateTime.now());
        inventarioProducto.setFechaUltimaActualizacion(LocalDateTime.now());

        inventarioProductoRepository.save(inventarioProducto);
    }

    @Override
    @Transactional
    public void consumirProductoElaborado(Long inventarioId, Long productoElaboradoId, Double cantidad) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        ProductoElaborado productoElaborado = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto elaborado no encontrado con id: " + productoElaboradoId));

        InventarioProducto inventarioProducto = inventarioProductoRepository
                .findByInventarioAndProductoElaborado(inventario, productoElaborado)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto elaborado no encontrado en el inventario"));

        if (inventarioProducto.getCantidad() < cantidad) {
            throw new IllegalStateException(
                    "Stock insuficiente. Disponible: " + inventarioProducto.getCantidad() + ", Requerido: " + cantidad);
        }

        inventarioProducto.setCantidad(inventarioProducto.getCantidad() - cantidad);
        inventarioProducto.setFechaUltimaActualizacion(LocalDateTime.now());

        inventarioProductoRepository.save(inventarioProducto);
    }

    @Override
    @Transactional
    public void eliminarProductoElaborado(Long inventarioProductoId) {
        InventarioProducto inventarioProducto = inventarioProductoRepository.findById(inventarioProductoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Inventario producto no encontrado con id: " + inventarioProductoId));

        inventarioProductoRepository.delete(inventarioProducto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoElaboradoStockResponse> obtenerProductosElaboradosPorInventario(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        List<InventarioProducto> productos = inventarioProductoRepository.findByInventarioId(inventario.getId());

        return productos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoElaboradoStockResponse> obtenerProductosElaboradosConStockBajo(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));

        List<InventarioProducto> productos = inventarioProductoRepository
                .findByInventarioIdAndCantidadLessThanStockMinimo(inventario.getId());

        return productos.stream()
                .map(ip -> {
                    ProductoElaboradoStockResponse response = convertirAResponse(ip);
                    response.setDeficit(ip.getStockMinimo() - ip.getCantidad());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoElaboradoStockResponse obtenerProductoElaboradoPorId(Long inventarioProductoId) {
        InventarioProducto inventarioProducto = inventarioProductoRepository.findById(inventarioProductoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Inventario producto no encontrado con id: " + inventarioProductoId));

        return convertirAResponse(inventarioProducto);
    }

    // Método auxiliar para convertir a Response
    private ProductoElaboradoStockResponse convertirAResponse(InventarioProducto ip) {
        ProductoElaborado pe = ip.getProductoElaborado();
        Receta receta = pe.getRecetaOrigen();

        return ProductoElaboradoStockResponse.builder()
                .inventarioProductoId(ip.getId())
                .productoElaboradoId(pe.getId())
                .nombre(pe.getNombre())
                .descripcion(pe.getDescripcion())
                .unidadMedida(pe.getUnidadMedida())
                .cantidad(ip.getCantidad())
                .stockMinimo(ip.getStockMinimo())
                .recetaOrigenId(receta != null ? receta.getId() : null)
                .recetaOrigenNombre(receta != null ? receta.getNombre() : null)
                .fechaUltimaActualizacion(ip.getFechaUltimaActualizacion())
                .fechaUltimaProduccion(ip.getFechaUltimaProduccion())
                .build();
    }

    @Override
    public List<InventarioItem> obtenerItemsConStockBajo(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new EntityNotFoundException("Inventario no encontrado con id: " + inventarioId));
        return inventarioItemRepository.findByInventarioIdAndCantidadLessThanStockMinimo(inventario.getId());
    }

    // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

}
