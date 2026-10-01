package com.api.apos.aplication.inventario.existencia.query;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.inventario.existencia.dto.MovimientoInventarioDto;
import com.api.apos.aplication.inventario.existencia.mapper.MovimientoInventarioMapper;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventarioService;
import com.api.apos.dto.PageResponse;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindMovimientosBySucursalId {

	private final MovimientoInventarioService movimientoService;

	public PageResponse<MovimientoInventarioDto> execute(Long sucursalId, Pageable pageable) {
		return PageResponse.from(movimientoService.findBySucursalId(sucursalId, pageable)
				.map(MovimientoInventarioMapper::toDto));
	}
}
