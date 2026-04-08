package com.api.apos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO completo para recetas con sus ingredientes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecetaDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer tiempoPreparacion;
    private Integer porciones;
    private BigDecimal precioVenta;
    private String tipoReceta; // INTERMEDIA o FINAL
    private Boolean activa;
    private Long sucursalId;
    private String sucursalNombre;
    private LocalDateTime fechaCreacion;
    private List<RecetaIngredienteDTO> ingredientes;
    private String productoElaboradoNombre; // Si genera un producto elaborado
}
