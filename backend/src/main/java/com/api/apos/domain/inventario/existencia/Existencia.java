package com.api.apos.domain.inventario.existencia;

import java.math.BigDecimal;

import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.enums.EstadoStock;
import com.api.apos.enums.UnidadMedida;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "existencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Existencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal cantidadActual;

    private BigDecimal cantidadMinima;

    @Enumerated(EnumType.STRING)
    private EstadoStock estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadMedida unidadMedida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

}
