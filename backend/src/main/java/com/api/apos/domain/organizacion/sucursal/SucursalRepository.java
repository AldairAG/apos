package com.api.apos.domain.organizacion.sucursal;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    Optional<Sucursal> findByCodigo(String codigo);

    List<Sucursal> findAllByEmpresaId(Long empresaId);

    @Query("SELECT s FROM Sucursal s WHERE s.empresa.id = :empresaId AND (s.activa = true OR s.activa IS NULL)")
    List<Sucursal> findActivasByEmpresaId(@Param("empresaId") Long empresaId);

    Optional<Sucursal> findByEmpresaId(Long empresaId);
}
