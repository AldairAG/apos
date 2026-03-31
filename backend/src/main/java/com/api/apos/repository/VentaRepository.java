package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Venta;
import com.api.apos.enums.EstadoVenta;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findBySucursalId(Long sucursalId);
    List<Venta> findByEstadoVenta(EstadoVenta estadoVenta);
    List<Venta> findBySucursalIdAndEstadoVenta(Long sucursalId, EstadoVenta estadoVenta);
}
