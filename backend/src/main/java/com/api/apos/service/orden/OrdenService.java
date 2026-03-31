package com.api.apos.service.orden;

import com.api.apos.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import java.util.List;
import java.util.Optional;

public interface OrdenService {
    List<Orden> findAll();

    Optional<Orden> findById(Long id);

    List<Orden> findBySucursalId(Long sucursalId);

    List<Orden> findByMesaId(Long mesaId);

    List<Orden> findByEstado(EstadoOrden estado);

    List<Orden> findBySucursalIdAndEstado(Long sucursalId, EstadoOrden estado);

    Orden save(Orden orden);

    Orden updateEstado(Long id, EstadoOrden estado);

    void deleteById(Long id);
}
