package com.api.apos.domain.extra.entity;

import java.time.LocalDateTime;

import com.api.apos.domain.producto.Producto;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
@Table(name = "producto_grupo_extra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoGrupoExtra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer minimo;
    private Integer maximo;
    private Boolean obligatorio;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "producto_id")
    @JsonBackReference
    private Producto producto;
    
    @ManyToOne
    @JoinColumn(name = "grupo_extra_id")
    private GrupoExtra grupoExtra;
}
