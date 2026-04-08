package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.Material;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    List<Material> findByActivoTrue();
    
    List<Material> findByTipoMaterial(String tipoMaterial);
}
