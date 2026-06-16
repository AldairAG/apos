package com.api.apos.domain.extra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.extra.entity.ProductoGrupoExtra;

public interface ProductoGrupoExtraRepository extends JpaRepository<ProductoGrupoExtra, Long> {
    
    List<ProductoGrupoExtra> findByProducto_Id(Long productoId);
    
    List<ProductoGrupoExtra> findByGrupoExtra_Id(Long grupoExtraId);
    
    void deleteByProducto_Id(Long productoId);
}
