package com.api.apos.domain.receta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.TipoReceta;
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
    private Double costoTotal; // Calculado a partir de los ingredientes
    private Double margenGanancia; // Calculado a partir del costo total y precio de venta
    private Double gananciaNeta;
    private Boolean activa;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    @JsonBackReference
    private Sucursal sucursal;
    
    // Indica si esta receta es un producto intermedio o final
    @Enumerated(EnumType.STRING)
    private TipoReceta tipoReceta;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
