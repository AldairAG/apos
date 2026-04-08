package com.api.apos.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el resultado de una producción de receta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduccionRecetaDTO {
    
    private Long id;
    private Long recetaId;
    private String recetaNombre;
    private String tipoReceta;
    private Long sucursalId;
    private String sucursalNombre;
    private Long usuarioId;
    private String usuarioEmail;
    private Integer cantidad;
    private LocalDateTime fechaProduccion;
    private String observaciones;
}
