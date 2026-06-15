package com.api.apos.domain.caja.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.empleado.entity.Empleado;

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
@Table(name = "corte_caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteCaja {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    
    private BigDecimal montoInicial;
    private BigDecimal montoFinal;
    private BigDecimal efectivoCalculado;
    private BigDecimal efectivoReal;
    private BigDecimal diferencia;
    private BigDecimal tarjetas;
    private BigDecimal transferencias;
    private BigDecimal totalVentas;
    private BigDecimal totalGastos;
    
    private Integer numeroOrdenes;
    
    private String observaciones;
    private Boolean cerrado;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    
    @ManyToOne
    @JoinColumn(name = "caja_id")
    private Caja caja;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
}
