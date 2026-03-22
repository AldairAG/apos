package com.api.apos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cortes_caja")
@Data
public class CorteCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Caja caja;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaFin;

    @Column(nullable = false)
    private BigDecimal montoInicial;

    @Column(nullable = false)
    private BigDecimal montoFinal;

    private BigDecimal totalVentas;
    private BigDecimal totalEntradas;
    private BigDecimal totalSalidas;
    private BigDecimal totalGastos;
    
    @Column(nullable = false)
    private BigDecimal diferencia; // montoFinal - (montoInicial + entradas - salidas)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuarioResponsable;

    private String observaciones;
}
