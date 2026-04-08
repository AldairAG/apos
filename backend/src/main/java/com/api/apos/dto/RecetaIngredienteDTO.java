package com.api.apos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para ingredientes de una receta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecetaIngredienteDTO {
    
    private Long id;
    private String tipoIngrediente; // MATERIAL o PRODUCTO_ELABORADO
    private Long materialId;
    private String materialNombre;
    private Long productoElaboradoId;
    private String productoElaboradoNombre;
    private String cantidadRequerida; // Como String para mejor manejo en frontend
    private String unidad;
    private String notas;
}
