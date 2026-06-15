package com.api.apos.domain.receta.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.receta.entity.Receta;

import java.util.List;

public interface RecetaRepository extends JpaRepository<Receta, Long> {
    
    List<Receta> findBySucursal_Id(Long sucursalId);
    
    List<Receta> findByActivaTrue();
    
    List<Receta> findBySucursal_IdAndActivaTrue(Long sucursalId);
}
