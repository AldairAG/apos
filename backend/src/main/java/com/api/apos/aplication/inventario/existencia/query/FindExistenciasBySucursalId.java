package com.api.apos.aplication.inventario.existencia.query;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.mapper.ExistenciaMapper;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.dto.PageResponse;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindExistenciasBySucursalId {

	private final ExistenciaService existenciaService;

	public PageResponse<ExistenciaDto> execute(Long sucursalId, Pageable pageable) {
		return PageResponse.from(existenciaService.findBySucursalId(sucursalId, pageable)
				.map(ExistenciaMapper::toDto));
	}
}