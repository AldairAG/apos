package com.api.apos.domain.sucursal;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    
    List<Sucursal> findByActivaTrue();

    List<Sucursal> findByUsuarioId(Long usuarioId);
}
