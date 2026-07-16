package com.api.apos.features.inventario;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.features.inventario.dto.MaterialDTO;
import com.api.apos.features.inventario.useCase.AjustarExistenciaUseCase;
import com.api.apos.features.inventario.useCase.HacerProduccionUseCase;
import com.api.apos.features.inventario.useCase.ObtenerExistenciasPorSucursalUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final ObtenerExistenciasPorSucursalUseCase obtenerExistenciasPorSucursalUseCase;

    private final AjustarExistenciaUseCase ajustarExistenciaUseCase;

    private final HacerProduccionUseCase hacerProduccionUseCase;

    
    /**
     * Ajustar la existencia de un producto en el inventario.
     * @param materialId - ID del material cuya existencia se desea ajustar.
     * @param nuevaExistencia - Nueva cantidad de existencia del material.
     */
    @PostMapping("/ajustarExistencia")
    public ResponseEntity<ApiResponseWrapper<MaterialDTO>> ajustarExistencia(@RequestParam String materialId, @RequestParam int nuevaExistencia) {
        try {
            ajustarExistenciaUseCase.execute(materialId, nuevaExistencia);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Hacer produccion de un producto intermedio, es decir, 
     * consumir los productos que lo componen y
     * aumentar la existencia del producto intermedio.
     * @param materialId - ID del material que se desea producir.
     * @param cantidad - Cantidad de material que se desea producir.
     */
    @PostMapping("/hacerProduccion")
    public ResponseEntity<ApiResponseWrapper<MaterialDTO>> hacerProduccion(@RequestParam String materialId, @RequestParam int cantidad) {
        try {
            hacerProduccionUseCase.execute(materialId, cantidad);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Obtener el inventario de una sucursal.
     * @return List<MaterialDTO> - Lista de materiales con sus existencias en la sucursal.
     * @param sucursalId - ID de la sucursal para la cual se desea obtener el inventario.
     * Endpoint: GET /api/inventario/getBySucursalId/{sucursalId}
     */
    @GetMapping("/getBySucursalId/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<MaterialDTO>>> getBySucursalId(@PathVariable Long sucursalId) {
        try {
            // Lógica para obtener el inventario de la sucursal
            List<MaterialDTO> inventario = obtenerExistenciasPorSucursalUseCase.execute(sucursalId);
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
