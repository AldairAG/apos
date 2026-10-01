package com.api.apos.aplication.inventario.existencia.usecase;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.existencia.dto.RegistrarMovimientoInventarioDto;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventario;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventarioService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.enums.ConceptoMovimientoInventario;
import com.api.apos.enums.EstadoStock;
import com.api.apos.enums.TipoMovimientoInventario;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AjustarExistenciaUseCase {

	private final ExistenciaService existenciaService;
	private final MaterialService materialService;
	private final SucursalService sucursalService;
	private final MovimientoInventarioService movimientoService;
	private final UsuarioService usuarioService;

	@Transactional
	public MovimientoInventario execute(RegistrarMovimientoInventarioDto request,
			ConceptoMovimientoInventario concepto) {
		if (request.getCantidad() == null || request.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
			throw new AppException(ErrorCode.CANTIDAD_INVALIDA);
		}
		if (request.getMaterialId() == null || request.getSucursalId() == null) {
			throw new AppException(ErrorCode.EXISTENCIA_NO_ENCONTRADA);
		}

		boolean esEntrada = concepto == ConceptoMovimientoInventario.COMPRA;
		Existencia existencia = existenciaService.findByMaterialIdAndSucursalId(
				request.getMaterialId(), request.getSucursalId());
		if (existencia == null && !esEntrada) {
			throw new AppException(ErrorCode.EXISTENCIA_NO_ENCONTRADA);
		}
		if (existencia == null) {
			Material material = materialService.findById(request.getMaterialId());
			if (material == null) {
				throw new AppException(ErrorCode.MATERIAL_NO_ENCONTRADO);
			}
			Sucursal sucursal = sucursalService.findById(request.getSucursalId());
			existencia = new Existencia().initCero();
			existencia.setMaterial(material);
			existencia.setSucursal(sucursal);
			existencia.setUnidadMedida(material.getUnidad());
		}

		BigDecimal cantidadActual = existencia.getCantidadActual() == null
				? BigDecimal.ZERO
				: existencia.getCantidadActual();
		if (!esEntrada && cantidadActual.compareTo(request.getCantidad()) < 0) {
			throw new AppException(ErrorCode.EXISTENCIA_INSUFICIENTE);
		}
		existencia.setCantidadActual(esEntrada
				? cantidadActual.add(request.getCantidad())
				: cantidadActual.subtract(request.getCantidad()));
		actualizarEstado(existencia);
		existenciaService.save(existencia);

		Usuario usuario = usuarioService.getUsuarioAutenticado();
		return movimientoService.save(MovimientoInventario.builder()
				.materialId(existencia.getMaterial().getId())
				.materialNombre(existencia.getMaterial().getNombre())
				.sucursalId(existencia.getSucursal().getId())
				.sucursalNombre(existencia.getSucursal().getNombre())
				.cantidad(request.getCantidad())
				.tipoMovimiento(esEntrada ? TipoMovimientoInventario.ENTRADA : TipoMovimientoInventario.SALIDA)
				.conceptoMovimiento(concepto)
				.fecha(LocalDateTime.now())
				.usuarioId(usuario.getId())
				.usuarioNombre(usuario.getNombre())
				.build());
	}

	private void actualizarEstado(Existencia existencia) {
		BigDecimal minimo = existencia.getCantidadMinima() == null
				? BigDecimal.ZERO
				: existencia.getCantidadMinima();
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
