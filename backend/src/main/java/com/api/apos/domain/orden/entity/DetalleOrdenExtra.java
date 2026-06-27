package com.api.apos.domain.orden.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.extra.entity.OpcionExtra;
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
@Table(name = "detalle_orden_extra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleOrdenExtra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "detalle_orden_id")
    @JsonIgnore
    private DetalleOrden detalleOrden;
    
    @ManyToOne
    @JoinColumn(name = "opcion_extra_id")
    @JsonIgnore
    private OpcionExtra opcionExtra;
}
