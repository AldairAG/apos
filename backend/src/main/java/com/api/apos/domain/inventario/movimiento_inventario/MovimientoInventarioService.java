package com.api.apos.domain.inventario.movimiento_inventario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoRepository;

    public MovimientoInventario save(MovimientoInventario movimiento) {
        return movimientoRepository.save(movimiento);
    }

    public Page<MovimientoInventario> findBySucursalId(Long sucursalId, Pageable pageable) {
        return movimientoRepository.findBySucursalId(sucursalId, pageable);
    }
}