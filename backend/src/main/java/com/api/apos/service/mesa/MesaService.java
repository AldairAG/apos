package com.api.apos.service.mesa;

import com.api.apos.entity.Mesa;
import java.util.List;
import java.util.Optional;

public interface MesaService {
    List<Mesa> findAll();
    Optional<Mesa> findById(Long id);
    List<Mesa> findBySucursalId(Long sucursalId);
    Mesa save(Mesa mesa);
    Mesa update(Long id, Mesa mesa);
    void deleteById(Long id);
}
