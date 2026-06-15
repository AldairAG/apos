package com.api.apos.domain.inventario.entity;

import java.time.LocalDateTime;

import com.api.apos.domain.material.Material;
import com.api.apos.domain.sucursal.Sucursal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class ExistenciaMaterial {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private java.math.BigDecimal stockActual;
    private java.math.BigDecimal stockMinimo;
    private java.math.BigDecimal stockMaximo;
    
    private String ubicacion;
    private String lote;
    private java.time.LocalDate fechaVencimiento;
    private Boolean alertaBajoStock;

    private LocalDateTime ultimaActualizacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
}
