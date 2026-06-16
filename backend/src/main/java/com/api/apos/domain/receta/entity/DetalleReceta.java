package com.api.apos.domain.receta.entity;

import java.math.BigDecimal;

import com.api.apos.domain.material.Material;
import com.api.apos.enums.Unidad;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class DetalleReceta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    private Unidad unidadMedida;

    private BigDecimal merma;

    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;

    @ManyToOne
    @JoinColumn(name = "insumo_id")
    private Material material;

}
