package com.api.apos.domain.producto;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    Optional<Producto> findByCodigo(String codigo);
    
    Optional<Producto> findBySku(String sku);
    
    List<Producto> findByCategoria_Id(Long categoriaId);
    
    List<Producto> findByReceta_Id(Long recetaId);
    
    List<Producto> findByActivoTrueAndDestacadoTrue();
    
    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) " +
           "OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :termino, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :termino, '%')))")
    List<Producto> buscarProductos(@Param("termino") String termino);
}
