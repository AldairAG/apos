package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.Material;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioItemRepository extends JpaRepository<InventarioItem, Long> {

    List<InventarioItem> findByInventarioId(Long inventarioId);

    Optional<InventarioItem> findByInventarioAndMaterial(Inventario inventario, Material material);

    // Encontrar items con stock bajo (cantidad menor al stock mínimo)
    @Query("SELECT i FROM InventarioItem i WHERE i.inventario.id = :inventarioId AND i.cantidad < i.stockMinimo")
    List<InventarioItem> findByInventarioIdAndCantidadLessThanStockMinimo(@Param("inventarioId") Long inventarioId);
}
