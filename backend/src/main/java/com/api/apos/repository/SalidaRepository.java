package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Salida;
import java.util.List;

public interface SalidaRepository extends JpaRepository<Salida, Long> {
    List<Salida> findBySucursalId(Long sucursalId);
}
