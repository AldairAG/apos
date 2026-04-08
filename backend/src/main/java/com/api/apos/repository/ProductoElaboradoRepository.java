package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.ProductoElaborado;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoElaboradoRepository extends JpaRepository<ProductoElaborado, Long> {
    
    List<ProductoElaborado> findByActivoTrue();
    
    Optional<ProductoElaborado> findByRecetaOrigenId(Long recetaId);
}
