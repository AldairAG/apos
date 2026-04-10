package com.api.apos.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "inventario_id")
    @JsonBackReference
    private Inventario inventario;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    @JsonManagedReference
    private Material material;
    
    private Double cantidad;
    private Double stockMinimo;
    private Double stockMaximo;
    private Double precioUnitario;
    
    private LocalDateTime fechaUltimaActualizacion;
    private LocalDateTime fechaUltimaCompra;
}
