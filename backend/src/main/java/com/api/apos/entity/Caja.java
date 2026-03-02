package com.api.apos.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cajas")
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double montoIncial;
    private Double montoEntrada;
    private Double montoFinal;
    private Double montoSalida;
    private Double montoActual;

    @OneToOne
    private Sucursal sucursal;
}
