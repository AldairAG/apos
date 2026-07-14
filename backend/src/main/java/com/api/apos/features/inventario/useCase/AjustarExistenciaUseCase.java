package com.api.apos.features.inventario.useCase;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AjustarExistenciaUseCase {
    
    public void execute(String materialId, int cantidad) {
        // Lógica para ajustar la existencia del material en el inventario
        // Por ejemplo, actualizar la base de datos con la nueva cantidad
    }

}
