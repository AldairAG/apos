package com.api.apos.aplication.inventario.receta.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DeleteRecetaUseCase {

    private final RecetaService recetaService;

    @Transactional
    public void execute(Long recetaId) {
        if (recetaId == null || recetaId <= 0) {
            throw new AppException(ErrorCode.RECETA_NO_ENCONTRADA);
        }

        Receta receta = recetaService.findById(recetaId);
        if (receta == null) {
            throw new AppException(ErrorCode.RECETA_NO_ENCONTRADA);
        }

        recetaService.delete(receta);
    }
}
