package com.api.apos.domain.inventario.existencias.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.sucursal.Sucursal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExistenciaMaterial {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private BigDecimal stockMaximo;
    
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
