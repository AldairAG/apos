package com.api.apos.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sucursales")
public class Sucursal {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @OneToOne
    private Caja caja;

    @OneToOne
    private Caja cajaDigital;

    @OneToMany(mappedBy = "sucursal")
    private List<Venta> ventas;

    @OneToMany(mappedBy = "sucursal")
    private List<Gasto> gastos;

    @OneToMany(mappedBy = "sucursal")
    private List<Ingreso> ingresos;

    @OneToMany(mappedBy = "sucursal")
    private List<Transferencia> transferencias;

    @OneToMany(mappedBy = "sucursal")
    private List<Salidas> salidas;



    



}
