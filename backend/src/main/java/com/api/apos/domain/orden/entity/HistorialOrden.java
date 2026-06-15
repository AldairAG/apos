package com.api.apos.domain.orden.entity;

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
@Table(name = "historial_orden")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialOrden {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String accion;
    private String observacion;
    
    private LocalDateTime fecha;
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "orden_id")
    private Orden orden;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
}
