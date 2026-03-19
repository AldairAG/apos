package com.api.apos.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categorias_gasto")
@Data
public class CategoriaGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;
}
