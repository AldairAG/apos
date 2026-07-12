package com.api.apos.domain.inventario.compra.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.inventario.material.Material;

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
@Table(name = "compra_detalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraDetalle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private BigDecimal cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "compra_inventario_id")
    private CompraInventario compraInventario;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;
}
