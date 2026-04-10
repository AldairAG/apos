package com.api.apos.entity;

import java.math.BigDecimal;

import com.api.apos.enums.TipoIngrediente;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

/**
 * Representa un ingrediente en una receta.
 * Puede ser un Material (ingrediente básico) o un ProductoElaborado (otra receta).
 */
@Data
@Entity
public class RecetaIngrediente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "receta_id")
    @JsonBackReference
    private Receta receta;
    
    // OPCIÓN 1: Material básico (harina, azúcar, etc.)
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;
    
    // OPCIÓN 2: Producto elaborado (masa, salsa, etc.) - resultado de otra receta
    @ManyToOne
    @JoinColumn(name = "producto_elaborado_id")
    @JsonBackReference
    private ProductoElaborado productoElaborado;
    
    // Indica qué tipo de ingrediente es
    @Enumerated(EnumType.STRING)
    private TipoIngrediente tipoIngrediente;
    
    private BigDecimal cantidadRequerida;
    private String notas; // Ej: "picado finamente", "a temperatura ambiente"

}
