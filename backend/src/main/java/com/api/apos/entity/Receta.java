package com.api.apos.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Data
@Entity
public class Receta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    private Integer tiempoPreparacion; // en minutos
    private Integer porciones;
    private BigDecimal precioVenta;
    private Boolean activa;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecetaIngrediente> ingredientes;
    
    // Si esta receta genera un producto elaborado que se puede almacenar
    @OneToOne(mappedBy = "recetaOrigen")
    private ProductoElaborado productoElaborado;
    
    // Indica si esta receta es un producto intermedio o final
    @Enumerated(EnumType.STRING)
    private TipoReceta tipoReceta;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    public enum TipoReceta {
        INTERMEDIA,  // Ej: "Masa de banderilla" - se usa en otras recetas
        FINAL        // Ej: "Banderillas terminadas" - producto final para venta
    }
}
