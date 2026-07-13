package com.api.apos.domain.inventario.existencias;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;

public interface ExistenciaRepository extends JpaRepository<ExistenciaMaterial, Long> {
    List<ExistenciaMaterial> findBySucursalIdAndMaterialIdIn(Long sucursalId, List<Long> materialIds);

    List<ExistenciaMaterial> findBySucursal_Id(Long sucursalId);
    
}
