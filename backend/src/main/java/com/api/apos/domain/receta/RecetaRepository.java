package com.api.apos.domain.receta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecetaRepository extends JpaRepository<Receta, Long> {
    
    List<Receta> findBySucursal_Id(Long sucursalId);
    
    List<Receta> findByActivaTrue();
    
    List<Receta> findBySucursal_IdAndActivaTrue(Long sucursalId);
}
