package com.api.apos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class InventarioItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "inventario_id")
    private Inventario inventario;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;
    
    private Double cantidad;
    private Double stockMinimo;
    private Double stockMaximo;
    private Double precioUnitario;
    
    private LocalDateTime fechaUltimaActualizacion;
    private LocalDateTime fechaUltimaCompra;
}
