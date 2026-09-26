package com.api.apos.domain.inventario.existencia;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExistenciaRepository extends JpaRepository<Existencia, Long> {
    List<Existencia> findBySucursalIdAndMaterialIdIn(
            Long sucursalId,
            List<Long> materialIds);

    @Query("""
                SELECT m.id
                FROM Material m
                WHERE m.id IN :materialIds
                  AND NOT EXISTS (
                      SELECT 1
                      FROM Existencia e
                      WHERE e.material.id = m.id
                        AND e.sucursal.id = :sucursalId
                  )
            """)
    List<Long> findMaterialIdsWithoutExistencia(
            @Param("materialIds") List<Long> materialIds,
            @Param("sucursalId") Long sucursalId);

    @Query("""
                SELECT e
                FROM Existencia e
                WHERE e.sucursal.id = :sucursalId
                  AND e.material.id IN :materialIds
            """)
    List<Existencia> findBySucursalAndMaterialIds(
            @Param("sucursalId") Long sucursalId,
            @Param("materialIds") List<Long> materialIds);

    @Query("""
                SELECT e
                FROM Existencia e
                WHERE e.material.id = :materialId
            """)
    List<Existencia> findAllByMaterialId(
            @Param("materialId") Long materialId);

    @Query("""
                SELECT e
                FROM Existencia e
                WHERE e.material.id IN :materialIds
            """)
    List<Existencia> findByMaterialIds(
            @Param("materialIds") List<Long> materialIds);
}
