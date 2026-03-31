package com.api.apos.service.venta;

import com.api.apos.entity.Venta;
import com.api.apos.enums.EstadoVenta;
import java.util.List;
import java.util.Optional;

public interface VentaService {
    List<Venta> findAll();
    Optional<Venta> findById(Long id);
    List<Venta> findBySucursalId(Long sucursalId);
    List<Venta> findByEstado(EstadoVenta estado);
    Venta save(Venta venta);
    Venta updateEstado(Long id, EstadoVenta estado);
    void deleteById(Long id);
}
