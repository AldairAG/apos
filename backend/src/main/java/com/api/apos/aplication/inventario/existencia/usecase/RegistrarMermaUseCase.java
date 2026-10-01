package com.api.apos.aplication.inventario.existencia.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.existencia.dto.RegistrarMovimientoInventarioDto;
import com.api.apos.domain.inventario.movimiento_inventario.MovimientoInventario;
import com.api.apos.enums.ConceptoMovimientoInventario;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarMermaUseCase {

	private final AjustarExistenciaUseCase ajustarExistencia;

	@Transactional
	public MovimientoInventario execute(RegistrarMovimientoInventarioDto request) {
		return ajustarExistencia.execute(request, ConceptoMovimientoInventario.MERMA);
	}
}
