package com.api.apos.aplication.inventario.existencia.usecase;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.api.apos.aplication.inventario.existencia.dto.ProductoDescuentoDto;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DescontarExistenciaByProductoIds {

    private final RecetaService recetaService;

    private final ExistenciaService existenciaService;

    @Transactional
    public void execute(ProductoDescuentoDto productoDescuentoDto) {

        // 1. Obtener receta
        List<RecetaDetalle> recetaDetalles = recetaService.findDetallesByProductoId(
                productoDescuentoDto.getProductoId());

        // 2. Calcular materiales necesarios
        Map<Long, BigDecimal> materialesNecesarios = new HashMap<>();

        BigDecimal cantidadVendida = BigDecimal.valueOf(productoDescuentoDto.getCantidad());

        for (RecetaDetalle detalle : recetaDetalles) {

            BigDecimal cantidadNecesaria = detalle.getCantidad().multiply(cantidadVendida);

            materialesNecesarios.merge(
                    detalle.getMaterial().getId(),
                    cantidadNecesaria,
                    BigDecimal::add);
        }

        // 3. Obtener existencias en una sola consulta
        List<Existencia> existenciasDb = existenciaService.findBySucursalIdAndMaterialIdIn(
                productoDescuentoDto.getSucursalId(),
                materialesNecesarios.keySet().stream().toList());

        // 4. Convertir a Map para búsquedas rápidas
        Map<Long, Existencia> existenciasPorMaterial = existenciasDb.stream()
                .collect(Collectors.toMap(
                        existencia -> existencia.getMaterial().getId(),
                        Function.identity()));

        // 5. Validar TODAS las existencias antes de modificar
        for (Map.Entry<Long, BigDecimal> entry : materialesNecesarios.entrySet()) {

            Existencia existencia = existenciasPorMaterial.get(entry.getKey());

            if (existencia == null) {
                throw new AppException(
                        ErrorCode.EXISTENCIA_NO_ENCONTRADA);
            }

            if (existencia.getCantidadActual()
                    .compareTo(entry.getValue()) < 0) {

                throw new AppException(
                        ErrorCode.EXISTENCIA_INSUFICIENTE);
            }
        }

        // 6. Descontar
        materialesNecesarios.forEach((materialId, cantidad) -> {

            Existencia existencia = existenciasPorMaterial.get(materialId);

            existencia.setCantidadActual(
                    existencia.getCantidadActual().subtract(cantidad));
        });
    }

}
