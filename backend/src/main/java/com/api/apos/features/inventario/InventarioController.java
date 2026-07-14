package com.api.apos.features.inventario;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.features.inventario.dto.MaterialDTO;
import com.api.apos.features.inventario.useCase.ObtenerExistenciasPorSucursalUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final ObtenerExistenciasPorSucursalUseCase inventarioService;
    
    /**
     * Ajustar la existencia de un producto en el inventario.
     */


    /**
     * Hacer produccion de un producto intermedio, es decir, 
     * consumir los productos que lo componen y
     * aumentar la existencia del producto intermedio.
     */

    /**
     * Obtener el inventario de una sucursal.
     * @return List<MaterialDTO> - Lista de materiales con sus existencias en la sucursal.
     * @param sucursalId - ID de la sucursal para la cual se desea obtener el inventario.
     */
    @GetMapping("/getBySucursalId/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<MaterialDTO>>> getMethodName(@PathVariable Long sucursalId) {
        try {
            // Lógica para obtener el inventario de la sucursal
            List<MaterialDTO> inventario = inventarioService.obtenerExistenciasPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, inventario, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
    

    /**
     * Registar merma de un producto en el inventario.
     */

    /**
     * Registrar merma de un material en el inventario.
     */

}
