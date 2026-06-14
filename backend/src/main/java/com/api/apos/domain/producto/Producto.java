package com.api.apos.domain.producto;

import com.api.apos.domain.receta.Receta;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String descripcion;

    private Float precio;

    private boolean activo;

    private boolean agotado;

    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;
}
    