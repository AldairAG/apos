package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Gasto;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findBySucursalId(Long sucursalId);

    List<Gasto> findByCategoriaId(Long categoriaId);
}
