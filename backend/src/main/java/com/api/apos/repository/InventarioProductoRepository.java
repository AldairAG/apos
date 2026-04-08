package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioProducto;
import com.api.apos.entity.ProductoElaborado;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioProductoRepository extends JpaRepository<InventarioProducto, Long> {
    
    List<InventarioProducto> findByInventarioId(Long inventarioId);
    
    Optional<InventarioProducto> findByInventarioAndProductoElaborado(Inventario inventario, ProductoElaborado productoElaborado);
    
    // Encontrar productos con stock bajo
    List<InventarioProducto> findByInventarioIdAndCantidadLessThanStockMinimo(Long inventarioId);
}
