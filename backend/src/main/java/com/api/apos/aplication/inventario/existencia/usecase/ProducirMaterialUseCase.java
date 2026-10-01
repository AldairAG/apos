package com.api.apos.aplication.inventario.existencia.usecase;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.existencia.dto.ProducirMaterialDto;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventario;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventarioService;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.enums.ConceptoMovimientoInventario;
import com.api.apos.enums.EstadoStock;
import com.api.apos.enums.TipoMovimientoInventario;
import com.api.apos.enums.TipoResultadoReceta;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProducirMaterialUseCase {

    private final RecetaService recetaService;
    private final ExistenciaService existenciaService;
    private final SucursalService sucursalService;
    private final UsuarioService usuarioService;
    private final MovimientoInventarioService movimientoService;

    @Transactional
    public List<MovimientoInventario> execute(ProducirMaterialDto request) {
        if (request.getCantidad() == null || request.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.CANTIDAD_INVALIDA);
        }
        Receta receta = recetaService.findById(request.getRecetaId());
        if (receta == null) {
            throw new AppException(ErrorCode.RECETA_NO_ENCONTRADA);
        }
        if (receta.getTipoResultado() != TipoResultadoReceta.MATERIAL
                || receta.getMaterialResultado() == null
                || receta.getRendimiento() == null
                || receta.getRendimiento() <= 0
                || receta.getRecetaDetalles() == null
                || receta.getRecetaDetalles().isEmpty()) {
            throw new AppException(ErrorCode.RECETA_RESULTADO_INVALIDO);
        }

        Sucursal sucursal = sucursalService.findById(request.getSucursalId());
        Material materialProducido = receta.getMaterialResultado();
        BigDecimal factor = request.getCantidad().divide(
                BigDecimal.valueOf(receta.getRendimiento()), 8, java.math.RoundingMode.HALF_UP);
        Map<Long, BigDecimal> cantidades = new HashMap<>();
        Map<Long, Material> materiales = new HashMap<>();
        for (RecetaDetalle detalle : receta.getRecetaDetalles()) {
            if (detalle.getCantidad() == null || detalle.getCantidad().compareTo(BigDecimal.ZERO) <= 0
                    || detalle.getMaterial() == null
                    || detalle.getMaterial().getId().equals(materialProducido.getId())) {
                throw new AppException(ErrorCode.RECETA_RESULTADO_INVALIDO);
            }
            cantidades.merge(detalle.getMaterial().getId(), detalle.getCantidad().multiply(factor), BigDecimal::add);
            materiales.put(detalle.getMaterial().getId(), detalle.getMaterial());
        }

        List<Existencia> existentesIngredientes = existenciaService.findBySucursalIdAndMaterialIdIn(
                sucursal.getId(), cantidades.keySet().stream().toList());
        Map<Long, Existencia> porMaterial = existentesIngredientes.stream()
                .collect(Collectors.toMap(item -> item.getMaterial().getId(), Function.identity()));
        for (Map.Entry<Long, BigDecimal> entry : cantidades.entrySet()) {
            Existencia existencia = porMaterial.get(entry.getKey());
            if (existencia == null) {
                throw new AppException(ErrorCode.EXISTENCIA_NO_ENCONTRADA);
            }
            if (existencia.getCantidadActual().compareTo(entry.getValue()) < 0) {
                throw new AppException(ErrorCode.EXISTENCIA_INSUFICIENTE);
            }
        }

        Existencia existenciaProducida = existenciaService.findByMaterialIdAndSucursalId(
                materialProducido.getId(), sucursal.getId());
        if (existenciaProducida == null) {
            existenciaProducida = new Existencia().initCero();
            existenciaProducida.setMaterial(materialProducido);
            existenciaProducida.setSucursal(sucursal);
            existenciaProducida.setUnidadMedida(materialProducido.getUnidad());
        }

        Usuario usuario = usuarioService.getUsuarioAutenticado();
        LocalDateTime fecha = LocalDateTime.now();
        List<MovimientoInventario> movimientos = new java.util.ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : cantidades.entrySet()) {
            Existencia existencia = porMaterial.get(entry.getKey());
            existencia.setCantidadActual(existencia.getCantidadActual().subtract(entry.getValue()));
            actualizarEstado(existencia);
            existenciaService.save(existencia);
            movimientos.add(crearMovimiento(materiales.get(entry.getKey()), sucursal, entry.getValue(),
                    TipoMovimientoInventario.SALIDA, usuario, fecha));
        }

        BigDecimal stockProducido = existenciaProducida.getCantidadActual() == null
                ? BigDecimal.ZERO
                : existenciaProducida.getCantidadActual();
        existenciaProducida.setCantidadActual(stockProducido.add(request.getCantidad()));
        actualizarEstado(existenciaProducida);
        existenciaService.save(existenciaProducida);
        movimientos.add(crearMovimiento(materialProducido, sucursal, request.getCantidad(),
                TipoMovimientoInventario.ENTRADA, usuario, fecha));
        return movimientos.stream().map(movimientoService::save).toList();
    }

    private MovimientoInventario crearMovimiento(Material material, Sucursal sucursal, BigDecimal cantidad,
            TipoMovimientoInventario tipo, Usuario usuario, LocalDateTime fecha) {
        return MovimientoInventario.builder()
                .materialId(material.getId())
                .materialNombre(material.getNombre())
                .sucursalId(sucursal.getId())
                .sucursalNombre(sucursal.getNombre())
                .cantidad(cantidad)
                .tipoMovimiento(tipo)
                .conceptoMovimiento(ConceptoMovimientoInventario.PRODUCCION)
                .usuarioId(usuario.getId())
                .usuarioNombre(usuario.getNombre())
                .fecha(fecha)
                .build();
    }

    private void actualizarEstado(Existencia existencia) {
        BigDecimal minimo = existencia.getCantidadMinima() == null ? BigDecimal.ZERO : existencia.getCantidadMinima();
        if (existencia.getCantidadActual().compareTo(BigDecimal.ZERO) == 0) {
            existencia.setEstado(EstadoStock.SIN_STOCK);
        } else if (minimo.compareTo(BigDecimal.ZERO) > 0
                && existencia.getCantidadActual().compareTo(minimo) < 0) {
            existencia.setEstado(EstadoStock.STOCK_BAJO);
        } else {
            existencia.setEstado(EstadoStock.STOCK_COMPLETO);
        }
    }
}