package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import java.util.List;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
    List<Orden> findBySucursalId(Long sucursalId);

    List<Orden> findByMesaId(Long mesaId);

    List<Orden> findByEstadoOrden(EstadoOrden estadoOrden);

    List<Orden> findBySucursalIdAndEstadoOrden(Long sucursalId, EstadoOrden estadoOrden);
}
