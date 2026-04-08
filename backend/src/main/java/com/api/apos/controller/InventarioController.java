package com.api.apos.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.api.apos.dto.ActualizarInventarioRequest;
import com.api.apos.dto.InventarioItemDTO;
import com.api.apos.dto.InventarioProductoDTO;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;
import com.api.apos.entity.Material;
import com.api.apos.entity.Sucursal;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.repository.InventarioItemRepository;
import com.api.apos.repository.InventarioProductoRepository;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.SucursalRepository;

/**
 * Controlador para gestionar el inventario de materiales y productos elaborados
 * Maneja el stock de cada sucursal
 */
@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioItemRepository inventarioItemRepository;
    
    @Autowired
    private InventarioProductoRepository inventarioProductoRepository;
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Autowired
    private SucursalRepository sucursalRepository;

    /**
     * GET /api/inventario/sucursal/{sucursalId}/materiales
     * Obtiene el inventario de materiales básicos de una sucursal
     * @param sucursalId ID de la sucursal
     * @return Lista de items en inventario con cantidades actuales
     */
    @GetMapping("/sucursal/{sucursalId}/materiales")
    public ResponseEntity<ApiResponseWrapper<List<InventarioItemDTO>>> obtenerInventarioMateriales(
            @PathVariable Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
            .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        
        List<InventarioItem> items = inventarioItemRepository.findByInventarioId(sucursal.getInventario().getId());
        List<InventarioItemDTO> itemsDTO = items.stream()
            .map(this::convertirItemADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, itemsDTO, "Inventario de materiales obtenido"));
    }

    /**
     * GET /api/inventario/sucursal/{sucursalId}/productos
     * Obtiene el inventario de productos elaborados de una sucursal
     * @param sucursalId ID de la sucursal
     * @return Lista de productos elaborados con cantidades disponibles
     */
    @GetMapping("/sucursal/{sucursalId}/productos")
    public ResponseEntity<ApiResponseWrapper<List<InventarioProductoDTO>>> obtenerInventarioProductos(
            @PathVariable Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
            .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        
        List<InventarioProducto> productos = inventarioProductoRepository
            .findByInventarioId(sucursal.getInventario().getId());
        List<InventarioProductoDTO> productosDTO = productos.stream()
            .map(this::convertirProductoADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, productosDTO, "Inventario de productos obtenido"));
    }

    /**
     * GET /api/inventario/sucursal/{sucursalId}/stock-bajo
     * Obtiene materiales con stock por debajo del mínimo (alerta de reposición)
     * @param sucursalId ID de la sucursal
     * @return Lista de materiales con stock bajo que requieren reposición
     */
    @GetMapping("/sucursal/{sucursalId}/stock-bajo")
    public ResponseEntity<ApiResponseWrapper<List<InventarioItemDTO>>> obtenerStockBajo(
            @PathVariable Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
            .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        
        List<InventarioItem> items = inventarioItemRepository.findByInventarioId(sucursal.getInventario().getId());
        List<InventarioItemDTO> stockBajo = items.stream()
            .filter(item -> item.getCantidad().compareTo(item.getStockMinimo()) < 0)
            .map(this::convertirItemADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, stockBajo, "Items con stock bajo obtenidos"));
    }

    /**
     * POST /api/inventario/sucursal/{sucursalId}/agregar
     * Agrega o actualiza el stock de un material en el inventario
     * Útil para registrar compras o ajustes de inventario
     * @param sucursalId ID de la sucursal
     * @param request Datos del material y cantidad a agregar
     * @return Item de inventario actualizado con nueva cantidad
     */
    @PostMapping("/sucursal/{sucursalId}/agregar")
    public ResponseEntity<ApiResponseWrapper<InventarioItemDTO>> agregarStock(
            @PathVariable Long sucursalId,
            @RequestBody ActualizarInventarioRequest request) {
        try {
            Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            
            Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material no encontrado"));
            
            Inventario inventario = sucursal.getInventario();
            
            // Buscar o crear el item en inventario
            InventarioItem item = inventarioItemRepository
                .findByInventarioAndMaterial(inventario, material)
                .orElseGet(() -> {
                    InventarioItem nuevo = new InventarioItem();
                    nuevo.setInventario(inventario);
                    nuevo.setMaterial(material);
                    nuevo.setCantidad(BigDecimal.ZERO);
                    nuevo.setStockMinimo(BigDecimal.TEN);
                    nuevo.setStockMaximo(BigDecimal.valueOf(1000));
                    return nuevo;
                });
            
            // Actualizar cantidad según operación
            if ("AGREGAR".equals(request.getOperacion())) {
                item.setCantidad(item.getCantidad().add(request.getCantidad()));
            } else if ("AJUSTAR".equals(request.getOperacion())) {
                item.setCantidad(request.getCantidad());
            }
            
            if (request.getPrecioUnitario() != null) {
                item.setPrecioUnitario(request.getPrecioUnitario());
            }
            
            item.setFechaUltimaActualizacion(LocalDateTime.now());
            item.setFechaUltimaCompra(LocalDateTime.now());
            
            InventarioItem guardado = inventarioItemRepository.save(item);
            
            return ResponseEntity.ok(
                new ApiResponseWrapper<>(true, convertirItemADTO(guardado), "Stock actualizado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, "Error: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/inventario/item/{itemId}/stock-minimo
     * Actualiza el stock mínimo de alerta para un item
     * @param itemId ID del item de inventario
     * @param stockMinimo Nuevo valor de stock mínimo
     * @return Item actualizado
     */
    @PutMapping("/item/{itemId}/stock-minimo")
    public ResponseEntity<ApiResponseWrapper<InventarioItemDTO>> actualizarStockMinimo(
            @PathVariable Long itemId,
            @RequestBody BigDecimal stockMinimo) {
        return inventarioItemRepository.findById(itemId)
            .map(item -> {
                item.setStockMinimo(stockMinimo);
                item.setFechaUltimaActualizacion(LocalDateTime.now());
                InventarioItem actualizado = inventarioItemRepository.save(item);
                return ResponseEntity.ok(
                    new ApiResponseWrapper<>(true, convertirItemADTO(actualizado), "Stock mínimo actualizado"));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Item no encontrado")));
    }

    /**
     * Convierte InventarioItem a DTO
     */
    private InventarioItemDTO convertirItemADTO(InventarioItem item) {
        boolean stockBajo = item.getStockMinimo() != null && 
                           item.getCantidad().compareTo(item.getStockMinimo()) < 0;
        
        return new InventarioItemDTO(
            item.getId(),
            item.getMaterial().getId(),
            item.getMaterial().getNombre(),
            item.getMaterial().getTipoUnidad() != null ? item.getMaterial().getTipoUnidad().name() : null,
            item.getCantidad(),
            item.getStockMinimo(),
            item.getStockMaximo(),
            item.getPrecioUnitario(),
            item.getFechaUltimaActualizacion(),
            stockBajo
        );
    }

    /**
     * Convierte InventarioProducto a DTO
     */
    private InventarioProductoDTO convertirProductoADTO(InventarioProducto producto) {
        boolean stockBajo = producto.getStockMinimo() != null && 
                           producto.getCantidad().compareTo(producto.getStockMinimo()) < 0;
        
        return new InventarioProductoDTO(
            producto.getId(),
            producto.getProductoElaborado().getId(),
            producto.getProductoElaborado().getNombre(),
            producto.getProductoElaborado().getUnidadMedida(),
            producto.getCantidad(),
            producto.getStockMinimo(),
            producto.getFechaUltimaProduccion(),
            stockBajo
        );
    }
}
