package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.Receta;

import java.util.List;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {
    
    List<Receta> findBySucursal_Id(Long sucursalId);
    
    List<Receta> findByActivaTrue();
    
    List<Receta> findBySucursal_IdAndActivaTrue(Long sucursalId);
}
