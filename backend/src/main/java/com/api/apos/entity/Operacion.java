package com.api.apos.entity;

import java.time.LocalDateTime;

import com.api.apos.enums.TipoOperacion;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public abstract class Operacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private TipoOperacion tipoOperacion;
    private Double monto;
    private String descripcion;

    private LocalDateTime fecha;

    private Categoria categoria;

    
}
