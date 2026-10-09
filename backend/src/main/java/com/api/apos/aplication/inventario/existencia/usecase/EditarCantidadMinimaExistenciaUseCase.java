package com.api.apos.aplication.inventario.existencia.usecase;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.mapper.ExistenciaMapper;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;

@Service
@AllArgsConstructor
public class EditarCantidadMinimaExistenciaUseCase {

    private final ExistenciaService existenciaService;

    /**
     * Este metodo edita los valores de la existencia en la sucursal como cantidad
     * minimo
     * 
     * @param request
     */
    @Transactional 
    public ExistenciaDto execute(ExistenciaDto request) {
        // Lógica para editar la cantidad mínima de la existencia en la sucursal

        Existencia existencia = existenciaService.findById(request.getId());
        existencia.editarCantidadMinima(request.getCantidadMinima());
        return ExistenciaMapper.toDto(existencia);

    }
}
