package com.api.apos.service.gastoreinversion;

import com.api.apos.entity.GastoReinversion;
import java.util.List;
import java.util.Optional;

public interface GastoReinversionService {
    List<GastoReinversion> findAll();

    Optional<GastoReinversion> findById(Long id);

    List<GastoReinversion> findBySucursalId(Long sucursalId);

    GastoReinversion save(GastoReinversion gastoReinversion);

    GastoReinversion update(Long id, GastoReinversion gastoReinversion);

    void deleteById(Long id);
}
