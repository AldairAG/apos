package com.api.apos.domain.caja.caja;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    List<Caja> findBySucursal_Id(Long sucursalId);
}
