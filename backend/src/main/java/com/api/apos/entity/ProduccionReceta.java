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
public class ProduccionReceta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Quien preparó la receta
    
    private Integer cantidad; // Cuántas porciones se produjeron
    private LocalDateTime fechaProduccion;
    private String observaciones;
}
