package com.api.apos.domain.extra.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.material.Material;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "opciones_extra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcionExtra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private BigDecimal precio;
    private Boolean activo;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "grupo_extra_id")
    private GrupoExtra grupoExtra;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    @JsonIgnore
    private Material material;
}
