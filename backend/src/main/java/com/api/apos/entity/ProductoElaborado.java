package com.api.apos.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

/**
 * Representa el resultado de elaborar una receta que puede almacenarse
 * y usarse como ingrediente en otras recetas.
 * Ejemplo: "Masa de banderilla", "Salsa especial", etc.
 */
@Data
@Entity
public class ProductoElaborado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    
    @ManyToOne
    @JoinColumn(name = "receta_origen_id")
    private Receta recetaOrigen; // Receta que crea este producto
    
    private String unidadMedida; // Ej: "porciones", "kilos", "litros"
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}
