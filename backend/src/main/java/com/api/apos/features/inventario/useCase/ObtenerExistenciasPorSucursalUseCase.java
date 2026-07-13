package com.api.apos.features.inventario.useCase;

import java.util.List;

import com.api.apos.features.inventario.dto.MaterialDTO;

public class ObtenerExistenciasPorSucursalUseCase {

    public List<MaterialDTO> execute(Long sucursalId) {
        // Lógica para obtener las existencias por sucursal
        // Aquí deberías llamar a tu servicio o repositorio para obtener los datos
        // Por ejemplo:
        // List<MaterialDTO> existencias = existenciaService.obtenerExistenciasPorSucursal(sucursalId);
        // return existencias;

        // Por ahora, devolvemos una lista vacía como ejemplo
        return List.of();
    }

}
