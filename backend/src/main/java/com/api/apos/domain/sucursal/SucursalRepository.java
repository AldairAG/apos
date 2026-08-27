package com.api.apos.domain.sucursal;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    Optional<Sucursal> findByCodigo(String codigo);

    List<Sucursal> findAllByEmpresaId(Long empresaId);
}
