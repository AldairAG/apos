package com.api.apos.domain.orden.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.orden.entity.DetalleOrdenExtra;

public interface DetalleOrdenExtraRepository extends JpaRepository<DetalleOrdenExtra, Long> {
    
    List<DetalleOrdenExtra> findByDetalleOrden_Id(Long detalleOrdenId);
}
