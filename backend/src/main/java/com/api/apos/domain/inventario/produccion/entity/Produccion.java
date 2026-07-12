package com.api.apos.domain.inventario.produccion.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.auth.empleado.entity.Empleado;
import com.api.apos.domain.catalogo.receta.entity.Receta;
import com.api.apos.domain.inventario.material.Material;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "produccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produccion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private BigDecimal cantidadProducida;
    private BigDecimal costoProduccion;
    
    private String observaciones;
    
    private LocalDateTime fecha;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    
    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
    
    @ManyToOne
    @JoinColumn(name = "material_producido_id")
    private Material materialProducido;
}
