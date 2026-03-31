package com.api.apos.service.venta;

import com.api.apos.entity.Orden;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Venta;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.EstadoVenta;
import com.api.apos.repository.OrdenRepository;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements VentaService {

    private final VentaRepository ventaRepository;
    private final OrdenRepository ordenRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Venta> findById(Long id) {
        return ventaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> findBySucursalId(Long sucursalId) {
        return ventaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> findByEstado(EstadoVenta estado) {
        return ventaRepository.findByEstadoVenta(estado);
    }

    @Override
    @Transactional
    public Venta save(Venta venta) {
        Orden orden = ordenRepository.findById(venta.getOrden().getId())
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        Sucursal sucursal = sucursalRepository.findById(venta.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        // Calcular total de la orden
        BigDecimal total = orden.getItems().stream()
                .map(item -> item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        venta.setOrden(orden);
        venta.setSucursal(sucursal);
        venta.setTotal(total);
        venta.setFechaHora(LocalDateTime.now());
        venta.setEstadoVenta(EstadoVenta.COMPLETADA);

        // Cerrar la orden
        orden.setEstadoOrden(EstadoOrden.PAGADA);
        ordenRepository.save(orden);

        return ventaRepository.save(venta);
    }

    @Override
    @Transactional
    public Venta updateEstado(Long id, EstadoVenta estado) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        venta.setEstadoVenta(estado);
        return ventaRepository.save(venta);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        ventaRepository.deleteById(id);
    }
}
