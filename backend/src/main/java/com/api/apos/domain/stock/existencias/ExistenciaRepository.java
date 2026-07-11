package com.api.apos.domain.stock.existencias;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.stock.existencias.entity.ExistenciaMaterial;

public interface ExistenciaRepository extends JpaRepository<ExistenciaMaterial, Long> {
    List<ExistenciaMaterial> findBySucursalIdAndMaterialIdIn(Long sucursalId, List<Long> materialIds);
    
}
