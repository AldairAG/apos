package com.api.apos.service.receta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;
import com.api.apos.entity.ProduccionReceta;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaIngrediente;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.repository.InventarioItemRepository;
import com.api.apos.repository.InventarioProductoRepository;
import com.api.apos.repository.ProduccionRecetaRepository;
import com.api.apos.repository.RecetaRepository;

@Service
public class ProduccionRecetaService {

    @Autowired
    private RecetaRepository recetaRepository;
    
    @Autowired
    private InventarioItemRepository inventarioItemRepository;
    
    @Autowired
    private InventarioProductoRepository inventarioProductoRepository;
    
    @Autowired
    private ProduccionRecetaRepository produccionRecetaRepository;

    /**
     * Elabora una receta y disminuye el inventario automáticamente.
     * Maneja recetas anidadas (ingredientes que son productos de otras recetas).
     * 
     * @param recetaId ID de la receta a elaborar
     * @param sucursal Sucursal donde se elabora
     * @param usuario Usuario que elabora la receta
     * @param cantidad Número de porciones a producir
     * @return La producción registrada
     * @throws RuntimeException si no hay suficiente inventario
     */
    @Transactional
    public ProduccionReceta elaborarReceta(Long recetaId, Sucursal sucursal, Usuario usuario, Integer cantidad) {
        // 1. Obtener la receta
        Receta receta = recetaRepository.findById(recetaId)
            .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        
        // 2. Verificar que hay suficiente inventario (materiales Y productos elaborados)
        List<RecetaIngrediente> ingredientes = receta.getIngredientes();
        for (RecetaIngrediente ingrediente : ingredientes) {
            BigDecimal cantidadNecesaria = ingrediente.getCantidadRequerida()
                .multiply(BigDecimal.valueOf(cantidad));
            
            if (ingrediente.getTipoIngrediente() == RecetaIngrediente.TipoIngrediente.MATERIAL) {
                // Es un material básico
                InventarioItem item = inventarioItemRepository
                    .findByInventarioAndMaterial(sucursal.getInventario(), ingrediente.getMaterial())
                    .orElseThrow(() -> new RuntimeException("Material " + ingrediente.getMaterial().getNombre() + " no encontrado en inventario"));
                
                if (item.getCantidad().compareTo(cantidadNecesaria) < 0) {
                    throw new RuntimeException("Inventario insuficiente de " + ingrediente.getMaterial().getNombre() + 
                        ". Necesario: " + cantidadNecesaria + ", Disponible: " + item.getCantidad());
                }
            } else {
                // Es un producto elaborado (resultado de otra receta)
                InventarioProducto producto = inventarioProductoRepository
                    .findByInventarioAndProductoElaborado(sucursal.getInventario(), ingrediente.getProductoElaborado())
                    .orElseThrow(() -> new RuntimeException("Producto elaborado " + ingrediente.getProductoElaborado().getNombre() + 
                        " no encontrado en inventario. Debe elaborar primero la receta: " + ingrediente.getProductoElaborado().getRecetaOrigen().getNombre()));
                
                if (producto.getCantidad().compareTo(cantidadNecesaria) < 0) {
                    throw new RuntimeException("Inventario insuficiente de " + ingrediente.getProductoElaborado().getNombre() + 
                        ". Necesario: " + cantidadNecesaria + ", Disponible: " + producto.getCantidad());
                }
            }
        }
        
        // 3. Disminuir el inventario
        for (RecetaIngrediente ingrediente : ingredientes) {
            BigDecimal cantidadNecesaria = ingrediente.getCantidadRequerida()
                .multiply(BigDecimal.valueOf(cantidad));
            
            if (ingrediente.getTipoIngrediente() == RecetaIngrediente.TipoIngrediente.MATERIAL) {
                // Disminuir material
                InventarioItem item = inventarioItemRepository
                    .findByInventarioAndMaterial(sucursal.getInventario(), ingrediente.getMaterial())
                    .get();
                
                item.setCantidad(item.getCantidad().subtract(cantidadNecesaria));
                item.setFechaUltimaActualizacion(LocalDateTime.now());
                inventarioItemRepository.save(item);
            } else {
                // Disminuir producto elaborado
                InventarioProducto producto = inventarioProductoRepository
                    .findByInventarioAndProductoElaborado(sucursal.getInventario(), ingrediente.getProductoElaborado())
                    .get();
                
                producto.setCantidad(producto.getCantidad().subtract(cantidadNecesaria));
                producto.setFechaUltimaActualizacion(LocalDateTime.now());
                inventarioProductoRepository.save(producto);
            }
        }
        
        // 4. Si esta receta genera un producto elaborado, agregarlo al inventario
        if (receta.getProductoElaborado() != null) {
            InventarioProducto inventarioProducto = inventarioProductoRepository
                .findByInventarioAndProductoElaborado(sucursal.getInventario(), receta.getProductoElaborado())
                .orElseGet(() -> {
                    InventarioProducto nuevo = new InventarioProducto();
                    nuevo.setInventario(sucursal.getInventario());
                    nuevo.setProductoElaborado(receta.getProductoElaborado());
                    nuevo.setCantidad(BigDecimal.ZERO);
                    return nuevo;
                });
            
            // Aumentar el inventario del producto elaborado
            inventarioProducto.setCantidad(inventarioProducto.getCantidad().add(BigDecimal.valueOf(cantidad)));
            inventarioProducto.setFechaUltimaActualizacion(LocalDateTime.now());
            inventarioProducto.setFechaUltimaProduccion(LocalDateTime.now());
            inventarioProductoRepository.save(inventarioProducto);
        }
        
        // 5. Registrar la producción
        ProduccionReceta produccion = new ProduccionReceta();
        produccion.setReceta(receta);
        produccion.setSucursal(sucursal);
        produccion.setUsuario(usuario);
        produccion.setCantidad(cantidad);
        produccion.setFechaProduccion(LocalDateTime.now());
        
        return produccionRecetaRepository.save(produccion);
    }
    
    /**
     * Verifica si hay suficiente inventario para elaborar una receta
     * (considerando materiales Y productos elaborados)
     */
    public boolean verificarInventarioDisponible(Long recetaId, Sucursal sucursal, Integer cantidad) {
        Receta receta = recetaRepository.findById(recetaId)
            .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        
        for (RecetaIngrediente ingrediente : receta.getIngredientes()) {
            BigDecimal cantidadNecesaria = ingrediente.getCantidadRequerida()
                .multiply(BigDecimal.valueOf(cantidad));
            
            if (ingrediente.getTipoIngrediente() == RecetaIngrediente.TipoIngrediente.MATERIAL) {
                InventarioItem item = inventarioItemRepository
                    .findByInventarioAndMaterial(sucursal.getInventario(), ingrediente.getMaterial())
                    .orElse(null);
                
                if (item == null || item.getCantidad().compareTo(cantidadNecesaria) < 0) {
                    return false;
                }
            } else {
                InventarioProducto producto = inventarioProductoRepository
                    .findByInventarioAndProductoElaborado(sucursal.getInventario(), ingrediente.getProductoElaborado())
                    .orElse(null);
                
                if (producto == null || producto.getCantidad().compareTo(cantidadNecesaria) < 0) {
                    return false;
                }
            }
        }
        
        return true;
    }
}
