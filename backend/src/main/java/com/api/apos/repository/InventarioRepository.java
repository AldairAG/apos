package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Inventario;
import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Optional<Inventario> findBySucursalId(Long sucursalId);
}
