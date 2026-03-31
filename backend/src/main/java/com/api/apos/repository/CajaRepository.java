package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Caja;
import java.util.List;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    List<Caja> findBySucursalId(Long sucursalId);
}
