package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.GastoReinversion;
import java.util.List;

public interface GastoReinversionRepository extends JpaRepository<GastoReinversion, Long> {
    List<GastoReinversion> findBySucursalId(Long sucursalId);

    List<GastoReinversion> findByCategoriaId(Long categoriaId);
}
