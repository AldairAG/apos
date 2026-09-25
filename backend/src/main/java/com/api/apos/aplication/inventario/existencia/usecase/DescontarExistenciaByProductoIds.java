package com.api.apos.aplication.inventario.existencia.usecase;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.receta.RecetaRepository;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DescontarExistenciaByProductoIds {

    private final RecetaRepository recetaRepository;

    @Transactional
    public void execute(List<Long> productoIds) {
        // Obtener detalles de la receta del producto
        List<RecetaDetalle> recetaDetalles = recetaRepository.findDetallesByProductoIds(productoIds);
        // Calcular la cantidad a descontar de cada material en base a los detalles de
        // la receta
        Map<Long, BigDecimal> materialesNecesarios = new HashMap<>();

        for (ProductoVenta venta : productosVendidos) {

            List<RecetaDetalle> receta = recetasPorProducto
                    .get(venta.productoId());

            for (RecetaDetalle detalle : receta) {

                BigDecimal cantidad = detalle.getCantidad()
                        .multiply(BigDecimal.valueOf(venta.cantidad()));

                materialesNecesarios.merge(
                        detalle.getMaterial().getId(),
                        cantidad,
                        BigDecimal::add);
            }
        }

        // Obtener todas las existencias
        Map<Long, Existencia> existencias = existenciasDb
                .stream()
                .collect(Collectors.toMap(
                        e -> e.getMaterial().getId(),
                        Function.identity()));
        // Vlidar existencias
        for (Map.Entry<Long, BigDecimal> entry : materialesNecesarios.entrySet()) {

            Existencia existencia = existencias.get(entry.getKey());

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
        // Actualizar existencia en sucursal
        materialesNecesarios.forEach((materialId, cantidad) -> {

            Existencia existencia = existencias.get(materialId);

            existencia.setCantidadActual(
                    existencia.getCantidadActual().subtract(cantidad));
        });

    }

}
