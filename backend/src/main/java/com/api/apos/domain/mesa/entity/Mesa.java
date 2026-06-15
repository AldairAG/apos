package com.api.apos.domain.mesa.entity;

import java.time.LocalDateTime;

import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.EstadoMesa;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "mesas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String codigo;
    private String ubicacion;
    
    private Integer capacidad;
    
    @Enumerated(EnumType.STRING)
    private EstadoMesa estado;
    
    private Boolean activa;
    private Long ordenActual;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
}
