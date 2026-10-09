package com.api.apos.aplication.inventario;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.dto.MovimientoInventarioDto;
import com.api.apos.aplication.inventario.existencia.dto.ProducirMaterialDto;
import com.api.apos.aplication.inventario.existencia.dto.RegistrarMovimientoInventarioDto;
import com.api.apos.aplication.inventario.existencia.mapper.MovimientoInventarioMapper;
import com.api.apos.aplication.inventario.existencia.query.FindExistenciasBySucursalId;
import com.api.apos.aplication.inventario.existencia.query.FindMovimientosBySucursalId;
import com.api.apos.aplication.inventario.existencia.usecase.AjustarExistenciaUseCase;
import com.api.apos.aplication.inventario.existencia.usecase.EditarCantidadMinimaExistenciaUseCase;
import com.api.apos.aplication.inventario.existencia.usecase.ProducirMaterialUseCase;
import com.api.apos.aplication.inventario.existencia.usecase.RegistrarMermaUseCase;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventario;
import com.api.apos.dto.PageResponse;
import com.api.apos.enums.ConceptoMovimientoInventario;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/inventario")
@AllArgsConstructor
public class InventarioController {

	private final FindExistenciasBySucursalId findExistencias;
	private final FindMovimientosBySucursalId findMovimientos;
	private final AjustarExistenciaUseCase ajustarExistencia;
	private final RegistrarMermaUseCase registrarMerma;
	private final ProducirMaterialUseCase producirMaterial;
	private final EditarCantidadMinimaExistenciaUseCase editarCantidadMinimaExistencia;

	@GetMapping("/sucursales/{sucursalId}/existencias")
	public ResponseEntity<ApiResponseWrapper<PageResponse<ExistenciaDto>>> existencias(
			@PathVariable Long sucursalId,
			@PageableDefault(size = 20, sort = "material.nombre", direction = Direction.ASC) Pageable pageable) {
		return ResponseEntity.ok(ApiResponseWrapper.success(findExistencias.execute(sucursalId, pageable)));
	}

	@GetMapping("/sucursales/{sucursalId}/movimientos")
	public ResponseEntity<ApiResponseWrapper<PageResponse<MovimientoInventarioDto>>> movimientos(
			@PathVariable Long sucursalId,
			@PageableDefault(size = 20, sort = "fecha", direction = Direction.DESC) Pageable pageable) {
		return ResponseEntity.ok(ApiResponseWrapper.success(findMovimientos.execute(sucursalId, pageable)));
	}

	@PostMapping("/entradas")
	public ResponseEntity<ApiResponseWrapper<MovimientoInventarioDto>> entrada(
			@RequestBody RegistrarMovimientoInventarioDto request) {
		return movimiento(ajustarExistencia.execute(request, ConceptoMovimientoInventario.COMPRA));
	}

	@PostMapping("/salidas")
	public ResponseEntity<ApiResponseWrapper<MovimientoInventarioDto>> salida(
			@RequestBody RegistrarMovimientoInventarioDto request) {
		return movimiento(ajustarExistencia.execute(request, ConceptoMovimientoInventario.AJUSTE));
	}

	@PostMapping("/mermas")
	public ResponseEntity<ApiResponseWrapper<MovimientoInventarioDto>> merma(
			@RequestBody RegistrarMovimientoInventarioDto request) {
		return movimiento(registrarMerma.execute(request));
	}

	@PostMapping("/consumo-personal")
	public ResponseEntity<ApiResponseWrapper<MovimientoInventarioDto>> consumoPersonal(
			@RequestBody RegistrarMovimientoInventarioDto request) {
		return movimiento(ajustarExistencia.execute(request, ConceptoMovimientoInventario.CONSUMO_PERSONAL));
	}

	@PostMapping("/produccion")
	public ResponseEntity<ApiResponseWrapper<java.util.List<MovimientoInventarioDto>>> produccion(
			@RequestBody ProducirMaterialDto request) {
		return ResponseEntity.ok(ApiResponseWrapper.success(producirMaterial.execute(request).stream()
				.map(MovimientoInventarioMapper::toDto)
				.toList()));
	}

	private ResponseEntity<ApiResponseWrapper<MovimientoInventarioDto>> movimiento(MovimientoInventario entity) {
		return ResponseEntity.ok(ApiResponseWrapper.success(MovimientoInventarioMapper.toDto(entity)));
	}

	@PatchMapping("/existencia/ajustar-minima")
	public ResponseEntity<ApiResponseWrapper<ExistenciaDto>> ajustarExistenciaMinima(
			@RequestBody ExistenciaDto request) {
		ExistenciaDto response = editarCantidadMinimaExistencia.execute(request);
		return ResponseEntity.ok(ApiResponseWrapper.success(response));
	}
}
