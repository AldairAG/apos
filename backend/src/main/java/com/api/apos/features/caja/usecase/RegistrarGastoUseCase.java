package com.api.apos.features.caja.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.mapper.MovimientoMapper;
import com.api.apos.domain.caja.movimeinto.service.MovimientoCajaService;
import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.service.MaterialService;
import com.api.apos.enums.TipoConceptoMovimiento;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarGastoUseCase {

    private final MovimientoCajaService movimientoCajaService;

    private final CajaService cajaService;

    private final MaterialService materialService;

    @Transactional
    public MovimientoCajaDTO registrarGastoUseCase(MovimientoCajaDTO movimiento) {

        MovimientoCaja movimientoCaja = MovimientoCaja.builder()
                .caja(cajaService.obtenerCajaPorId(movimiento.getCajaId()))
                .tipoMovimiento(movimiento.getTipoMovimiento())
                .monto(movimiento.getMonto())
                .metodoPago(movimiento.getMetodoPago())
                .conceptoMovimiento(movimiento.getConceptoMovimiento())
                .concepto(movimiento.getConcepto())
                .referencia(movimiento.getReferencia())
                .fecha(LocalDateTime.now())
                .aprobado(false)
                .createdAt(LocalDateTime.now())
                .createdBy(movimiento.getEmpleadoId())
                .build();

        MovimientoCaja nuevoMovimiento = movimientoCajaService.registrarMovimiento(movimientoCaja);

        if(nuevoMovimiento.getConceptoMovimiento() == TipoConceptoMovimiento.GASTO_RESTOCK) {
            gastoRestockt(movimiento);
        }

        return MovimientoMapper.toDTO(nuevoMovimiento);
    }

    /**
     * Registrar un gasto de restock de material
     * Aumentara la existencia del material en la sucursal correspondiente
     * @param movimiento
     */
    private void gastoRestockt(MovimientoCajaDTO movimiento) {
        MovimientoCajaDTO.restockDTO restockMaterial = movimiento.getRestock();
        Material material = materialService.obtenerMaterialPorId(restockMaterial.getMaterialId())
                .orElseThrow(()->new IllegalArgumentException("Material no encontrado " + restockMaterial.getMaterialId()));
        
        ExistenciaMaterial existenciaMaterial = material.getExistencias().stream()
            .filter(existencia -> existencia.getSucursal().getId().equals(movimiento.getCajaId()))
            .findFirst()
            .orElseThrow(()->new IllegalArgumentException("Material no encontrado en sucursal " + movimiento.getCajaId()));

        existenciaMaterial.setStockActual(existenciaMaterial.getStockActual().add(restockMaterial.getCantidad()));
    }
    
}
