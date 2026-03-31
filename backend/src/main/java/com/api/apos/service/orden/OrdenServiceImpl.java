package com.api.apos.service.orden;

import com.api.apos.entity.Mesa;
import com.api.apos.entity.Orden;
import com.api.apos.entity.Sucursal;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.repository.MesaRepository;
import com.api.apos.repository.OrdenRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenServiceImpl implements OrdenService {

    private final OrdenRepository ordenRepository;
    private final SucursalRepository sucursalRepository;
    private final MesaRepository mesaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Orden> findAll() {
        return ordenRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Orden> findById(Long id) {
        return ordenRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Orden> findBySucursalId(Long sucursalId) {
        return ordenRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Orden> findByMesaId(Long mesaId) {
        return ordenRepository.findByMesaId(mesaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Orden> findByEstado(EstadoOrden estado) {
        return ordenRepository.findByEstadoOrden(estado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Orden> findBySucursalIdAndEstado(Long sucursalId, EstadoOrden estado) {
        return ordenRepository.findBySucursalIdAndEstadoOrden(sucursalId, estado);
    }

    @Override
    @Transactional
    public Orden save(Orden orden) {
        Sucursal sucursal = sucursalRepository.findById(orden.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        Mesa mesa = mesaRepository.findById(orden.getMesa().getId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        orden.setSucursal(sucursal);
        orden.setMesa(mesa);
        orden.setFechaCreacion(LocalDateTime.now());
        orden.setEstadoOrden(EstadoOrden.ABIERTA);
        return ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public Orden updateEstado(Long id, EstadoOrden estado) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        orden.setEstadoOrden(estado);
        return ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        ordenRepository.deleteById(id);
    }
}
