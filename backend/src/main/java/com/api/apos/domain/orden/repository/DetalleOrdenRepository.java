package com.api.apos.domain.orden.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.orden.entity.DetalleOrden;

public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Long> {
    
    List<DetalleOrden> findByOrden_Id(Long ordenId);
    
    List<DetalleOrden> findByProducto_Id(Long productoId);
}
